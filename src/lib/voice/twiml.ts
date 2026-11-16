// ─────────────────────────────────────────────────────────────────────────────
// TwiML builders
// Twilio has no Marathi <Say> voice, so Marathi text is spoken by Aditi (hi-IN),
// which reads Devanagari correctly. For a true Pune/Mumbai accent, configure
// ElevenLabs and the agent plays generated audio instead of using <Say>.
// ─────────────────────────────────────────────────────────────────────────────

import type { VoiceLanguage } from "./config";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sayLanguage(lang: VoiceLanguage): string {
  return lang === "mr-IN" ? "hi-IN" : lang;
}

export function say(text: string, lang: VoiceLanguage): string {
  return `<Say voice="Polly.Aditi" language="${sayLanguage(lang)}">${escapeXml(text)}</Say>`;
}

export function play(url: string): string {
  return `<Play>${escapeXml(url)}</Play>`;
}

/** Speaks the line either as generated audio (premium) or via <Say>. */
export function spoken(text: string, lang: VoiceLanguage, audioUrl?: string | null): string {
  return audioUrl ? play(audioUrl) : say(text, lang);
}

export function gather(params: {
  actionUrl: string;
  lang: VoiceLanguage;
  prompt: string;
  timeoutSeconds?: number;
}): string {
  const timeout = params.timeoutSeconds ?? 6;
  return [
    `<Gather input="speech" action="${escapeXml(params.actionUrl)}" method="POST"`,
    ` language="${params.lang}" speechTimeout="auto" timeout="${timeout}"`,
    ` actionOnEmptyResult="true">`,
    params.prompt,
    `</Gather>`,
  ].join("");
}

export function redirect(url: string): string {
  return `<Redirect method="POST">${escapeXml(url)}</Redirect>`;
}

export function dial(number: string): string {
  return `<Dial timeout="30">${escapeXml(number)}</Dial>`;
}

export function hangup(): string {
  return `<Hangup/>`;
}

export function twiml(...nodes: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${nodes.join("")}</Response>`;
}
