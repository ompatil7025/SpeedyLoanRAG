// -----------------------------------------------------------------------------
// Minimal Twilio client (REST, no SDK): Programmable Voice + WhatsApp.
//
// Trial accounts reject some optional parameters ("trial accounts have limited
// parameter access"), so calls are attempted with the richest parameter set
// first and retried with progressively simpler sets.
// -----------------------------------------------------------------------------

import { voiceConfig } from "./config";

export interface OutboundCallResult {
  sid: string;
  status: string;
  /** Which parameter set Twilio accepted. */
  mode: "full" | "standard" | "minimal";
}

type CallParams = Record<string, string | string[]>;

function buildParameterSets(params: {
  to: string;
  twimlUrl: string;
  statusUrl: string;
}): { mode: OutboundCallResult["mode"]; values: CallParams }[] {
  // NOTE: trial accounts reject the `Method` parameter outright
  // ("Invalid or disallowed parameters"), so it is deliberately omitted.
  const base: CallParams = {
    To: params.to,
    From: voiceConfig.twilio.fromNumber,
    Url: params.twimlUrl,
  };

  return [
    {
      mode: "full",
      values: {
        ...base,
        StatusCallback: params.statusUrl,
        StatusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
        Timeout: "25",
      },
    },
    {
      mode: "standard",
      values: {
        ...base,
        StatusCallback: params.statusUrl,
      },
    },
    { mode: "minimal", values: base },
  ];
}

function encode(values: CallParams): string {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      for (const entry of value) body.append(key, entry);
    } else {
      body.set(key, value);
    }
  }
  return body.toString();
}

const TRIAL_RESTRICTION = /limited parameter access/i;

function authHeader(): string {
  const { accountSid, authToken } = voiceConfig.twilio;
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
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

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
  const auth = authHeader();

  let lastError = "call_failed";

  for (const attempt of buildParameterSets(params)) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: encode(attempt.values),
      cache: "no-store",
    });

    const raw = await res.text();

    if (res.ok) {
      let parsed: { sid?: string; status?: string } = {};
      try {
        parsed = JSON.parse(raw) as { sid?: string; status?: string };
      } catch {
        /* ignore */
      }
      return { sid: parsed.sid ?? "", status: parsed.status ?? "queued", mode: attempt.mode };
    }

    let detail = raw.slice(0, 300);
    try {
      const parsed = JSON.parse(raw) as { code?: number; message?: string };
      detail = `${parsed.code ?? res.status}: ${parsed.message ?? "Twilio error"}`;
    } catch {
      /* keep raw */
    }

    lastError = `twilio_${res.status}: ${detail}`;

    // Only retry when the failure is the trial parameter restriction.
    if (!TRIAL_RESTRICTION.test(raw)) break;
  }

  throw new Error(lastError);
}

/**
 * Sends the lead summary to the sales WhatsApp number.
 * Best effort: a failure never breaks the call.
 */
export async function sendLeadToWhatsApp(body: string): Promise<{ ok: boolean; detail?: string }> {
  const { accountSid, authToken } = voiceConfig.twilio;
  const { from, leadNumber } = voiceConfig.whatsapp;

  if (!accountSid || !authToken) {
    return { ok: false, detail: "whatsapp_not_configured" };
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const params = new URLSearchParams({
    From: from,
    To: `whatsapp:${leadNumber}`,
    Body: body.slice(0, 1500),
  });

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    });

    if (res.ok) return { ok: true };

    const raw = await res.text();
    let detail = raw.slice(0, 200);
    try {
      const parsed = JSON.parse(raw) as { code?: number; message?: string };
      detail = `${parsed.code ?? res.status}: ${parsed.message ?? "WhatsApp error"}`;
    } catch {
      /* keep raw */
    }
    console.warn("[voice] whatsapp lead failed:", detail);
    return { ok: false, detail };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown";
    console.warn("[voice] whatsapp lead failed:", detail);
    return { ok: false, detail };
  }
}
