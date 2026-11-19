// -----------------------------------------------------------------------------
// /api/voice/turn
//
// Turn 1 captures the caller's first name and delivers the scripted intro
// (time-of-day greeting, company, verifiable Chinchwad office, polite loan ask).
// Later turns run the bank-style qualification. Once the profile is complete the
// lead is analysed, stored for the on-page panel, and pushed to WhatsApp.
// -----------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import {
  detectLanguage,
  extractName,
  generateReply,
  introScript,
  noInputPrompt,
} from "@/lib/voice/agent";
import { LANGUAGE_LABELS, voiceConfig } from "@/lib/voice/config";
import { analyseLead, formatLeadMessage } from "@/lib/voice/lead";
import { saveLead } from "@/lib/voice/leadStore";
import { decodeState, encodeState, newCallState, type AgentTurn } from "@/lib/voice/state";
import { logVoiceCall } from "@/lib/voice/store";
import { sendLeadToWhatsApp } from "@/lib/voice/twilio";
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

  // -- Silence: re-prompt twice, then close the call politely -----------------
  if (!speech) {
    const nextStage = state.stage + 1;
    if (nextStage > 4) {
      return xml(twiml(say(noInputPrompt(state.lang, 2), state.lang), hangup()));
    }
    const next = { ...state, stage: nextStage };
    return xml(twiml(redirect(`${voiceConfig.siteUrl}/api/voice/twiml/?s=${encodeState(next)}`)));
  }

  // -- Turn 1: capture the name, deliver the scripted intro --------------------
  if (state.stage === 0) {
    const lang = detectLanguage(speech, state.lang);
    const callerName = extractName(speech) || state.callerName || "";
    const line = introScript(lang, callerName);

    const history: AgentTurn[] = [
      ...state.history,
      { role: "user", text: speech.slice(0, 200) },
      { role: "model", text: line },
    ];

    const next = { ...state, lang, stage: 1, turn: state.turn + 1, callerName, history };

    await logVoiceCall({
      call_sid: callSid || `turn-${Date.now()}`,
      to_number: to || null,
      from_number: from || null,
      language: lang,
      turns: next.turn,
      transcript: history,
    });

    const actionUrl = `${voiceConfig.siteUrl}/api/voice/turn/?s=${encodeState(next)}`;
    return xml(twiml(gather({ actionUrl, lang, prompt: spoken(line, lang, speechUrl(line, lang)) })));
  }

  // -- Qualification turns ----------------------------------------------------
  const history: AgentTurn[] = [...state.history, { role: "user", text: speech.slice(0, 200) }];

  const reply = await generateReply({
    utterance: speech,
    language: state.lang,
    history: state.history,
    name: state.callerName || state.name,
    leadSent: state.leadSent === true,
  });

  const line = spoken(reply.text, reply.language, speechUrl(reply.text, reply.language));
  const modelTurn: AgentTurn = { role: "model", text: reply.text };

  const next = {
    ...state,
    lang: reply.language,
    turn: state.turn + 1,
    stage: 2,
    history: [...history, modelTurn].slice(-18),
    leadSent: state.leadSent,
  };

  // -- Analyse the call, store the lead, push it to WhatsApp -------------------
  if (reply.sendLead && !state.leadSent) {
    const callerName = state.callerName || state.name || "";

    try {
      const analysis = await analyseLead(next.history, callerName);

      await saveLead({
        ...analysis,
        id: callSid || `lead-${Date.now()}`,
        callSid: callSid || `lead-${Date.now()}`,
        name: callerName,
        phone: state.phone || from || "",
        language: LANGUAGE_LABELS[reply.language],
        createdAt: new Date().toISOString(),
        transcript: next.history.map((turn) => ({ role: turn.role, text: turn.text })),
      });

      const result = await sendLeadToWhatsApp(
        formatLeadMessage({
          name: callerName,
          phone: state.phone || from || "",
          language: LANGUAGE_LABELS[reply.language],
          analysis,
        })
      );
      if (!result.ok) console.warn("[voice] lead not delivered:", result.detail);
    } catch (error) {
      console.warn("[voice] lead pipeline failed:", error instanceof Error ? error.message : error);
    }

    next.leadSent = true;
  }

  await logVoiceCall({
    call_sid: callSid || `turn-${Date.now()}`,
    to_number: to || null,
    from_number: from || null,
    language: reply.language,
    turns: next.turn,
    transcript: next.history,
  });

  if (reply.transfer) {
    return xml(twiml(line, dial(voiceConfig.handoffNumber), hangup()));
  }

  if (reply.endCall) {
    return xml(twiml(line, hangup()));
  }

  const actionUrl = `${voiceConfig.siteUrl}/api/voice/turn/?s=${encodeState(next)}`;
  return xml(twiml(gather({ actionUrl, lang: reply.language, prompt: line })));
}
