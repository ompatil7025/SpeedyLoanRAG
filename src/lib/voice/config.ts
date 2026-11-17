// -----------------------------------------------------------------------------
// Voice agent configuration
// Server-only module. Never import this in a client component.
// -----------------------------------------------------------------------------

export type VoiceLanguage = "en-IN" | "hi-IN" | "mr-IN";

export const SUPPORTED_LANGUAGES: VoiceLanguage[] = ["en-IN", "hi-IN", "mr-IN"];

export const LANGUAGE_LABELS: Record<VoiceLanguage, string> = {
  "en-IN": "English",
  "hi-IN": "हिंदी",
  "mr-IN": "मराठी",
};

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://speedyloanfinance.com").replace(/\/+$/, "");

export const voiceConfig = {
  siteUrl,

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
    authToken: process.env.TWILIO_AUTH_TOKEN ?? "",
    fromNumber: process.env.TWILIO_PHONE_NUMBER ?? "",
  },

  // WhatsApp delivery of the lead summary.
  whatsapp: {
    // Twilio WhatsApp sender. The sandbox default works on trial accounts once
    // the receiving number has joined the sandbox.
    from: process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886",
    leadNumber: process.env.VOICE_LEAD_WHATSAPP || "+917350005590",
  },

  elevenLabs: {
    apiKey: process.env.ELEVENLABS_API_KEY ?? "",
    voiceId: process.env.ELEVENLABS_VOICE_ID ?? "",
    modelId: process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2",
  },

  // Number the AI hands the call over to when the caller asks for a human.
  handoffNumber: process.env.VOICE_HANDOFF_NUMBER ?? "+917350005590",

  // Secret used to sign text-to-speech URLs. Falls back to the Twilio token so
  // a single credential is enough to get started.
  ttsSecret: process.env.VOICE_TTS_SECRET || process.env.TWILIO_AUTH_TOKEN || "",

  // Optional: allows staff to dial any number instead of only the caller's own.
  adminToken: process.env.VOICE_ADMIN_TOKEN ?? "",
};

export function telephonyConfigured(): boolean {
  const { accountSid, authToken, fromNumber } = voiceConfig.twilio;
  return Boolean(accountSid && authToken && fromNumber);
}

export function premiumVoiceConfigured(): boolean {
  return Boolean(voiceConfig.elevenLabs.apiKey && voiceConfig.elevenLabs.voiceId && voiceConfig.ttsSecret);
}

/** Capability summary safe to expose to the browser. */
export function voiceCapabilities() {
  return {
    configured: telephonyConfigured(),
    premiumVoice: premiumVoiceConfigured(),
    whatsapp: Boolean(voiceConfig.twilio.accountSid && voiceConfig.twilio.authToken),
    languages: SUPPORTED_LANGUAGES,
  };
}
