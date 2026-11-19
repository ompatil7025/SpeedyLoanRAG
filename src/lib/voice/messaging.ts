// -----------------------------------------------------------------------------
// Outbound messaging (SMS + WhatsApp) via Twilio
//
// Trial accounts can only message verified recipients, and India requires DLT
// registration for A2P SMS, so every failure is surfaced with Twilio's reason
// instead of pretending the message went out.
// -----------------------------------------------------------------------------

import { voiceConfig } from "./config";

export type Channel = "sms" | "whatsapp";

export interface SendResult {
  ok: boolean;
  sid?: string;
  detail?: string;
}

const OFFICE = "Speedy Loan Finance Services, Mayur Trade Center, Chinchwad, Pune 411019";
const PHONE = "73500 05590";
const SITE = "https://speedyloanfinance.com";

/** Short, DLT-shaped SMS body — no URLs that carriers may block, under 160 chars where possible. */
export function buildSmsBody(name?: string): string {
  const who = name ? `${name}, ` : "";
  return `${who}thanks for your enquiry with Speedy Loan Finance Services, Chinchwad Pune. Our advisor will call you shortly. Personal, home, business & MSME loans, zero upfront fees. Call ${PHONE}.`;
}

/** Richer WhatsApp body — formatting and links render natively. */
export function buildWhatsAppBody(name?: string): string {
  const who = name ? `*${name}*, ` : "";
  return [
    `${who}thank you for contacting *Speedy Loan Finance Services*.`,
    "",
    "We received your loan enquiry. A senior advisor will call you on this number shortly.",
    "",
    "*What we arrange*",
    "• Personal & business loans",
    "• Home loans & loan against property",
    "• MSME and working capital",
    "• Balance transfer at lower rates",
    "",
    "*Office*",
    OFFICE,
    `Call ${PHONE} • Mon–Sat, 9 AM – 7 PM`,
    "",
    "Zero upfront fees. We work with 15+ banks and NBFCs through Andromeda.",
    "",
    SITE,
  ].join("\n");
}

function authHeader(): string {
  const { accountSid, authToken } = voiceConfig.twilio;
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
}

function senderFor(channel: Channel): string {
  return channel === "whatsapp"
    ? voiceConfig.whatsapp.from
    : voiceConfig.twilio.fromNumber;
}

function recipientFor(channel: Channel, phone: string): string {
  return channel === "whatsapp" ? `whatsapp:${phone}` : phone;
}

export function messagingConfigured(): boolean {
  const { accountSid, authToken, fromNumber } = voiceConfig.twilio;
  return Boolean(accountSid && authToken && fromNumber);
}

export async function sendMessage(params: {
  channel: Channel;
  phone: string;
  body: string;
}): Promise<SendResult> {
  const { accountSid } = voiceConfig.twilio;

  if (!accountSid || !voiceConfig.twilio.authToken) {
    return { ok: false, detail: "messaging_not_configured" };
  }

  const payload = new URLSearchParams({
    To: recipientFor(params.channel, params.phone),
    From: senderFor(params.channel),
    Body: params.body.slice(0, 1500),
  });

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload.toString(),
        cache: "no-store",
      }
    );

    const raw = await res.text();

    if (res.ok) {
      let sid = "";
      try {
        sid = (JSON.parse(raw) as { sid?: string }).sid ?? "";
      } catch {
        /* ignore */
      }
      return { ok: true, sid };
    }

    let detail = raw.slice(0, 240);
    try {
      const parsed = JSON.parse(raw) as { code?: number; message?: string };
      detail = `${parsed.code ?? res.status}: ${parsed.message ?? "Twilio error"}`;
    } catch {
      /* keep raw */
    }
    console.warn(`[messaging] ${params.channel} failed:`, detail);
    return { ok: false, detail };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown";
    console.warn(`[messaging] ${params.channel} failed:`, detail);
    return { ok: false, detail };
  }
}

/** Maps a Twilio failure to something a visitor can act on. */
export function friendlyError(channel: Channel, detail?: string): string {
  if (!detail) return "Could not send the message. Please try again.";
  if (detail === "messaging_not_configured") {
    return "Messaging is not active yet. Please call 73500 05590.";
  }
  if (/21610|unsubscribed|blacklist/i.test(detail)) {
    return "That number has opted out of messages from this sender.";
  }
  if (/63007|63016|sandbox/i.test(detail)) {
    return "WhatsApp delivery to this number is not enabled yet. Join our WhatsApp sandbox from that phone, or call 73500 05590.";
  }
  if (/572002|verified recipient|not a valid/i.test(detail)) {
    return "This number is not verified for messaging on our account yet. Please call 73500 05590.";
  }
  if (/21608|21211/i.test(detail)) {
    return "That mobile number looks invalid. Please check and try again.";
  }
  if (/DLT|template/i.test(detail)) {
    return "SMS to Indian numbers needs DLT registration. Please use WhatsApp or call 73500 05590.";
  }
  return channel === "whatsapp"
    ? "Could not send the WhatsApp message. Please call 73500 05590."
    : "Could not send the SMS. Please call 73500 05590.";
}
