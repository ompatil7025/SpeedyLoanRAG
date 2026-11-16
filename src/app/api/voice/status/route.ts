// ─────────────────────────────────────────────────────────────────────────────
// /api/voice/status
// Twilio status callback: records duration and final state for each call.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { logVoiceCall } from "@/lib/voice/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let form = new URLSearchParams();
  try {
    form = new URLSearchParams(await req.text());
  } catch {
    /* ignore */
  }

  const callSid = form.get("CallSid");
  if (!callSid) {
    return new NextResponse(null, { status: 204 });
  }

  const durationRaw = Number(form.get("CallDuration") ?? "");

  await logVoiceCall({
    call_sid: callSid,
    to_number: form.get("To"),
    from_number: form.get("From"),
    status: form.get("CallStatus"),
    duration_seconds: Number.isFinite(durationRaw) ? durationRaw : null,
  });

  return new NextResponse(null, { status: 204 });
}
