// ─────────────────────────────────────────────────────────────────────────────
// Signed speech URLs
//
// The agent speaks generated audio from /api/voice/tts. The URL carries the
// text, signed with an HMAC so the endpoint cannot be used as a free TTS proxy.
// ─────────────────────────────────────────────────────────────────────────────

import crypto from "node:crypto";
import { premiumVoiceConfigured, voiceConfig, type VoiceLanguage } from "./config";

function sign(payload: string): string {
  return crypto.createHmac("sha256", voiceConfig.ttsSecret).update(payload).digest("base64url");
}

export function verifySpeechToken(token: string): { text: string; lang: VoiceLanguage } | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || !voiceConfig.ttsSecret) return null;

  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const separator = payload.indexOf("|");
  if (separator < 0) return null;

  const lang = payload.slice(0, separator);
  if (lang !== "en-IN" && lang !== "hi-IN" && lang !== "mr-IN") return null;

  return { lang, text: payload.slice(separator + 1) };
}

/** Returns a public audio URL for the line, or null when premium voice is off. */
export function speechUrl(text: string, lang: VoiceLanguage): string | null {
  if (!premiumVoiceConfigured() || !text.trim()) return null;

  const encoded = Buffer.from(`${lang}|${text}`, "utf8").toString("base64url");
  const token = `${encoded}.${sign(encoded)}`;
  return `${voiceConfig.siteUrl}/api/voice/tts/?p=${encodeURIComponent(token)}`;
}
