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
const MAX_CALLS_PER_WINDOW = 3;

// Best-effort limiter. Serverless instances each keep their own map, so this
// slows abuse down rather than guaranteeing a hard cap.
const recentCalls = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recentCalls.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);

  if (hits.length >= MAX_CALLS_PER_WINDOW) {
    recentCalls.set(ip, hits);
    return true;
  }

  hits.push(now);
  recentCalls.set(ip, hits);
  if (recentCalls.size > 5000) recentCalls.clear();
  return false;
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

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const name = (payload.name ?? "").trim().slice(0, 60) || undefined;
  const state = encodeState(newCallState(language, name));

  const twimlUrl = `${voiceConfig.siteUrl}/api/voice/twiml/?s=${state}`;
  const statusUrl = `${voiceConfig.siteUrl}/api/voice/status/?s=${state}`;

  try {
    const call = await createOutboundCall({ to, twimlUrl, statusUrl });

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
    return NextResponse.json({ error: "call_failed" }, { status: 502 });
  }
}
