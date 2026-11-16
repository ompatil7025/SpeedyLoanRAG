// ─────────────────────────────────────────────────────────────────────────────
// /api/voice/twiml
// Entry TwiML for a call: greeting (stage 0) or a silence re-prompt (stage 1+).
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { greeting, noInputPrompt } from "@/lib/voice/agent";
import { voiceConfig } from "@/lib/voice/config";
import { decodeState, encodeState, newCallState } from "@/lib/voice/state";
import { gather, hangup, say, twiml } from "@/lib/voice/twiml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function xml(body: string) {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function handle(req: NextRequest) {
  const url = new URL(req.url);
  const state = decodeState(url.searchParams.get("s")) ?? newCallState("en-IN");

  const actionUrl = `${voiceConfig.siteUrl}/api/voice/turn/?s=${encodeState(state)}`;

  if (state.stage === 0) {
    const line = greeting(state.lang, state.name);
    // Seed the history with the greeting so the model does not introduce
    // itself again on the caller's first reply.
    const seeded = {
      ...state,
      history: [{ role: "model" as const, text: line }],
    };
    const seededAction = `${voiceConfig.siteUrl}/api/voice/turn/?s=${encodeState(seeded)}`;
    return xml(twiml(gather({ actionUrl: seededAction, lang: state.lang, prompt: say(line, state.lang) })));
  }

  if (state.stage === 1) {
    const line = noInputPrompt(state.lang, 1);
    return xml(twiml(gather({ actionUrl, lang: state.lang, prompt: say(line, state.lang) })));
  }

  return xml(twiml(say(noInputPrompt(state.lang, 2), state.lang), hangup()));
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
