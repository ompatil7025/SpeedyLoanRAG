// ─────────────────────────────────────────────────────────────────────────────
// Minimal Twilio Programmable Voice client (REST, no SDK).
// Docs: https://www.twilio.com/docs/voice/api/call-resource
// ─────────────────────────────────────────────────────────────────────────────

import { voiceConfig } from "./config";

export interface OutboundCallResult {
  sid: string;
  status: string;
}

export async function createOutboundCall(params: {
  to: string;
  twimlUrl: string;
  statusUrl: string;
}): Promise<OutboundCallResult> {
  const { accountSid, authToken, fromNumber } = voiceConfig.twilio;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("telephony_not_configured");
  }

  const body = new URLSearchParams();
  body.set("To", params.to);
  body.set("From", fromNumber);
  body.set("Url", params.twimlUrl);
  body.set("Method", "POST");
  body.set("StatusCallback", params.statusUrl);
  body.set("StatusCallbackMethod", "POST");
  for (const event of ["initiated", "ringing", "answered", "completed"]) {
    body.append("StatusCallbackEvent", event);
  }
  body.set("Timeout", "25");

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const raw = await res.text();

  if (!res.ok) {
    let detail = raw.slice(0, 300);
    try {
      const parsed = JSON.parse(raw) as { code?: number; message?: string };
      detail = `${parsed.code ?? res.status}: ${parsed.message ?? "Twilio error"}`;
    } catch {
      /* keep raw */
    }
    throw new Error(`twilio_${res.status}: ${detail}`);
  }

  let parsed: { sid?: string; status?: string } = {};
  try {
    parsed = JSON.parse(raw) as { sid?: string; status?: string };
  } catch {
    /* ignore */
  }

  return { sid: parsed.sid ?? "", status: parsed.status ?? "queued" };
}
