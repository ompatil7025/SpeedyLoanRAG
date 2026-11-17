// -----------------------------------------------------------------------------
// /api/voice/turn
//
// Turn 1 captures the caller's first name and delivers the scripted intro
// (time-of-day greeting, company, verifiable Chinchwad office, polite loan ask).
// Later turns are Gemini-driven qualification. When the caller is interested the
// collected details are pushed to WhatsApp.
// -----------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import {
  detectLanguage,
  extractName,
  generateReply,
  introScript,
  noInputPrompt,
  summariseLead,
} from "@/lib/voice/agent";
import { LANGUAGE_LABELS, voiceConfig } from "@/lib/voice/config";
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

function leadMessage(params: {
  callerName: string;
  phone: string;
  language: string;
  summary: string;
}): string {
  const lines = [
    "*New loan enquiry — AI call*",
    "",
    `Name: ${params.callerName || "not shared"}`,
    `Phone: ${params.phone || "not shared"}`,
    `Language: ${params.language}`,
    "",
    params.summary || "Customer details captured on the call.",
    "",
    "_Speedy Loan Finance Services • AI voice advisor_",
  ];
  return lines.join("\n");
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
    if (nextStage > 2) {
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
      { role: "user", text: speech.slice(0, 240) },
      { role: "model", text: line },
    ];

    const next = {
      ...state,
      lang,
      stage: 1,
      turn: state.turn + 1,
      callerName,
      history,
    };

    await logVoiceCall({
      call_sid: callSid || `turn-${Date.now()}`,
      to_number: to || null,
      from_number: from || null,
      language: lang,
      turns: next.turn,
      transcript: history,
    });

    const actionUrl = `${voiceConfig.siteUrl}/api/voice/turn/?s=${encodeState(next)}`;
    return xml(
      twiml(gather({ actionUrl, lang, prompt: spoken(line, lang, speechUrl(line, lang)) }))
    );
  }

  // -- Qualification turns ----------------------------------------------------
  const history: AgentTurn[] = [...state.history, { role: "user", text: speech.slice(0, 240) }];

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
    history: [...history, modelTurn].slice(-14),
    leadSent: state.leadSent,
  };

  // -- Push the lead to WhatsApp once the customer shows interest -------------
  if (reply.sendLead && !state.leadSent) {
    const callerName = state.callerName || state.name || "";
    const summary = await summariseLead(next.history, callerName);
    const result = await sendLeadToWhatsApp(
      leadMessage({
        callerName,
        phone: from,
        language: LANGUAGE_LABELS[reply.language],
        summary,
      })
    );
    next.leadSent = true;
    if (!result.ok) {
      console.warn("[voice] lead not delivered:", result.detail);
    }
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
