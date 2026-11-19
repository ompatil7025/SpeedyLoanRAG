// ─────────────────────────────────────────────────────────────────────────────
// POST /api/voice/outbound
// Places an outbound AI call. The number must be supplied with explicit consent.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import {
  SUPPORTED_LANGUAGES,
  telephonyConfigured,
  voiceCapabilities,
  voiceConfig,
  type VoiceLanguage,
} from "@/lib/voice/config";
import { createOutboundCall } from "@/lib/voice/twilio";
import { encodeState, newCallState } from "@/lib/voice/state";
import { logVoiceCall } from "@/lib/voice/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 10;      // generous: staff testing from one connection
const MAX_PER_NUMBER = 3;   // strict: never spam the same person

// Best-effort limiter. Serverless instances each keep their own map, so this
// slows abuse down rather than guaranteeing a hard cap.
const recentCalls = new Map<string, number[]>();

function tooMany(key: string, max: number): boolean {
  const now = Date.now();
  const hits = (recentCalls.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  recentCalls.set(key, hits);
  return hits.length >= max;
}

/** Recorded only after Twilio accepts the call, so failed attempts never count. */
function recordCall(key: string): void {
  const now = Date.now();
  const hits = [...(recentCalls.get(key) ?? []), now];
  recentCalls.set(key, hits);
  if (recentCalls.size > 5000) recentCalls.clear();
}

function normaliseIndianMobile(input: string): string | null {
  const digits = (input || "").replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(local)) return null;
  return `+91${local}`;
}

export async function GET() {
  return NextResponse.json(voiceCapabilities());
}

export async function POST(req: NextRequest) {
  let payload: { phone?: string; language?: string; consent?: boolean; name?: string };

  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (payload.consent !== true) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }

  const to = normaliseIndianMobile(payload.phone ?? "");
  if (!to) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const language: VoiceLanguage = SUPPORTED_LANGUAGES.includes(payload.language as VoiceLanguage)
    ? (payload.language as VoiceLanguage)
    : "en-IN";

  if (!telephonyConfigured()) {
    return NextResponse.json(
      { error: "voice_not_configured", ...voiceCapabilities() },
      { status: 503 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (tooMany(`ip:${ip}`, MAX_PER_IP) || tooMany(`to:${to}`, MAX_PER_NUMBER)) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message:
          "This number has had several call attempts in the last hour. Please try again later or call 73500 05590.",
      },
      { status: 429 }
    );
  }

  const name = (payload.name ?? "").trim().slice(0, 60) || undefined;
  const state = encodeState(newCallState(language, name, to));

  const twimlUrl = `${voiceConfig.siteUrl}/api/voice/twiml/?s=${state}`;
  const statusUrl = `${voiceConfig.siteUrl}/api/voice/status/?s=${state}`;

  try {
    const call = await createOutboundCall({ to, twimlUrl, statusUrl });

    recordCall(`ip:${ip}`);
    recordCall(`to:${to}`);

    await logVoiceCall({
      call_sid: call.sid || `pending-${Date.now()}`,
      to_number: to,
      from_number: voiceConfig.twilio.fromNumber,
      status: call.status,
      language,
      source: "web_callback",
    });

    return NextResponse.json({ ok: true, sid: call.sid, status: call.status, language });
  } catch (error) {
    const message = error instanceof Error ? error.message : "call_failed";
    console.error("[voice] outbound failed:", message);

    // Trial accounts can only dial numbers verified in the Twilio console.
    const trialLimit = /573002|21210|21608|verified recipient|not a verified/i.test(message);
    const friendly = trialLimit
      ? "This number is not verified on our Twilio trial account. Add it under Twilio → Phone Numbers → Verified Caller IDs, or upgrade the account to call any number."
      : "Twilio rejected the call. Please try again, or call 73500 05590.";

    return NextResponse.json({ error: "call_failed", message: friendly }, { status: 502 });
  }
}
