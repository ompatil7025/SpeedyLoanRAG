// -----------------------------------------------------------------------------
// POST /api/voice/notify
// Sends the Speedy Loan brochure/next-steps message to a number over SMS or
// WhatsApp. Consent is required, and each number is rate limited.
// -----------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import {
  buildSmsBody,
  buildWhatsAppBody,
  friendlyError,
  messagingConfigured,
  sendMessage,
  type Channel,
} from "@/lib/voice/messaging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_NUMBER = 3;

const recent = new Map<string, number[]>();

function throttled(key: string): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  if (hits.length >= MAX_PER_NUMBER) {
    recent.set(key, hits);
    return true;
  }
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5000) recent.clear();
  return false;
}

function normaliseIndianMobile(input: string): string | null {
  const digits = (input || "").replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(local)) return null;
  return `+91${local}`;
}

export async function GET() {
  return NextResponse.json({ configured: messagingConfigured() });
}

export async function POST(req: NextRequest) {
  let payload: { phone?: string; channel?: string; name?: string; consent?: boolean };

  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (payload.consent !== true) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }

  const phone = normaliseIndianMobile(payload.phone ?? "");
  if (!phone) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const channel: Channel = payload.channel === "whatsapp" ? "whatsapp" : "sms";

  if (!messagingConfigured()) {
    return NextResponse.json({ error: "messaging_not_configured" }, { status: 503 });
  }

  if (throttled(`${channel}:${phone}`)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const name = (payload.name ?? "").trim().slice(0, 40) || undefined;
  const body = channel === "whatsapp" ? buildWhatsAppBody(name) : buildSmsBody(name);

  const result = await sendMessage({ channel, phone, body });

  if (!result.ok) {
    return NextResponse.json(
      { error: "send_failed", message: friendlyError(channel, result.detail) },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, channel, sid: result.sid });
}
