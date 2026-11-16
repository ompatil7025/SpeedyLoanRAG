// ─────────────────────────────────────────────────────────────────────────────
// Call state
//
// Vercel functions are stateless, so the conversation state travels with the
// call as a compact base64url token inside the Twilio webhook URLs. History is
// trimmed aggressively to keep the URL well under Twilio's limits.
// ─────────────────────────────────────────────────────────────────────────────

import type { VoiceLanguage } from "./config";

export interface AgentTurn {
  role: "user" | "model";
  text: string;
}

export interface CallState {
  lang: VoiceLanguage;
  turn: number;
  /** 0 = greeting sent, 1 = first nudge after silence, 2 = goodbye sent. */
  stage: number;
  history: AgentTurn[];
  name?: string;
}

const MAX_TURNS = 6; // user+model pairs kept in state
const MAX_TEXT = 240;

export function newCallState(lang: VoiceLanguage, name?: string): CallState {
  return { lang, turn: 0, stage: 0, history: [], name };
}

export function encodeState(state: CallState): string {
  const compact: CallState = {
    ...state,
    history: state.history
      .filter((t) => t.text.trim().length > 0)
      .slice(-MAX_TURNS * 2)
      .map((t) => ({ role: t.role, text: t.text.slice(0, MAX_TEXT) })),
  };
  return Buffer.from(JSON.stringify(compact), "utf8").toString("base64url");
}

export function decodeState(token: string | null): CallState | null {
  if (!token) return null;
  try {
    const json = Buffer.from(token, "base64url").toString("utf8");
    if (json.length > 8000) return null;
    const parsed = JSON.parse(json) as Partial<CallState>;
    if (!parsed || typeof parsed !== "object") return null;

    const lang: VoiceLanguage =
      parsed.lang === "hi-IN" || parsed.lang === "mr-IN" ? parsed.lang : "en-IN";

    return {
      lang,
      turn: typeof parsed.turn === "number" && parsed.turn >= 0 ? parsed.turn : 0,
      stage: typeof parsed.stage === "number" && parsed.stage >= 0 ? parsed.stage : 0,
      history: Array.isArray(parsed.history)
        ? parsed.history
            .filter(
              (t): t is AgentTurn =>
                !!t &&
                (t.role === "user" || t.role === "model") &&
                typeof t.text === "string"
            )
            .slice(-MAX_TURNS * 2)
        : [],
      name: typeof parsed.name === "string" ? parsed.name.slice(0, 60) : undefined,
    };
  } catch {
    return null;
  }
}
