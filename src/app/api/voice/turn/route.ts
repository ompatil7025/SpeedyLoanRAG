// ─────────────────────────────────────────────────────────────────────────────
// /api/voice/turn
// Twilio posts the recognised speech here. We answer with the next TwiML node:
// another question, a hold + handoff to a human, or a polite hangup.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { generateReply, noInputPrompt } from "@/lib/voice/agent";
import { voiceConfig } from "@/lib/voice/config";
import { decodeState, encodeState, newCallState, type AgentTurn } from "@/lib/voice/state";
import { logVoiceCall } from "@/lib/voice/store";
import { speechUrl } from "@/lib/voice/tts";
import { dial, gather, hangup, redirect, say, spoken, twiml } from "@/lib/voice/twiml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function xml(body: string) {
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const state = decodeState(url.searchParams.get("s")) ?? newCallState("en-IN");

  let form = new URLSearchParams();
  try {
    form = new URLSearchParams(await req.text());
  } catch {
    /* empty body */
  }

  const speech = (form.get("SpeechResult") ?? "").trim();
  const callSid = form.get("CallSid") ?? "";
  const from = form.get("From") ?? "";
  const to = form.get("To") ?? "";

  // ── Silence: re-prompt twice, then close the call politely ─────────────────
  if (!speech) {
    const nextStage = state.stage + 1;

    if (nextStage > 2) {
      return xml(twiml(say(noInputPrompt(state.lang, 2), state.lang), hangup()));
    }

    const next = { ...state, stage: nextStage };
    return xml(
      twiml(redirect(`${voiceConfig.siteUrl}/api/voice/twiml/?s=${encodeState(next)}`))
    );
  }

  const history: AgentTurn[] = [
    ...state.history,
    { role: "user", text: speech.slice(0, 240) },
  ];

  const reply = await generateReply({
    utterance: speech,
    language: state.lang,
    history: state.history,
    name: state.name,
  });

  const line = spoken(reply.text, reply.language, speechUrl(reply.text, reply.language));

  const modelTurn: AgentTurn = { role: "model", text: reply.text };
  const nextHistory: AgentTurn[] = [...history, modelTurn].slice(-12);
  const nextState = {
    ...state,
    lang: reply.language,
    turn: state.turn + 1,
    stage: 0,
    history: nextHistory,
  };

  // Persist progress so the lead survives even if the call drops.
  await logVoiceCall({
    call_sid: callSid || `turn-${Date.now()}`,
    to_number: to || null,
    from_number: from || null,
    language: reply.language,
    turns: nextState.turn,
    transcript: nextHistory,
  });

  // ── Hand over to a human advisor ──────────────────────────────────────────
  if (reply.transfer) {
    return xml(twiml(line, dial(voiceConfig.handoffNumber), hangup()));
  }

  // ── Natural end of conversation ───────────────────────────────────────────
  if (reply.endCall) {
    return xml(twiml(line, hangup()));
  }

  // ── Continue the conversation ─────────────────────────────────────────────
  const actionUrl = `${voiceConfig.siteUrl}/api/voice/turn/?s=${encodeState(nextState)}`;
  return xml(twiml(gather({ actionUrl, lang: reply.language, prompt: line })));
}
