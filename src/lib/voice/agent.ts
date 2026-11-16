// ─────────────────────────────────────────────────────────────────────────────
// Voice agent brain
//
// Reuses the same RAG knowledge base as the website chatbot, but rewrites the
// answers for speech: short, warm, one question at a time, no markdown.
// ─────────────────────────────────────────────────────────────────────────────

import { retrieve } from "@/lib/ragRetriever";
import type { VoiceLanguage } from "./config";
import type { AgentTurn } from "./state";

const MARATHI_HINTS = [
  "आहे", "काय", "मला", "तुम्ही", "आपण", "कृपया", "हवे", "हवा", "हवी", "पाहिजे",
  "नमस्कार", "धन्यवाद", "कर्ज", "माहिती", "किती", "कसे", "कधी", "माझ्या", "तुमच्या",
  "सांगा", "बोलतोय", "बोलतेय", "चालेल", "नाही",
];

const HINDI_HINTS = [
  "है", "हूँ", "हूं", "क्या", "मुझे", "आप", "आपका", "आपकी", "चाहिए", "कृपया",
  "नमस्ते", "धन्यवाद", "ऋण", "जानकारी", "कितना", "कैसे", "कब", "मेरा", "बताइए",
  "बोलिए", "ठीक",
];

const LANGUAGE_NAME: Record<VoiceLanguage, string> = {
  "en-IN": "English",
  "hi-IN": "Hindi (Devanagari script)",
  "mr-IN": "Marathi (Devanagari script)",
};

const FALLBACK_REPLY: Record<VoiceLanguage, string> = {
  "en-IN": "Sorry, I didn't catch that clearly. Which loan are you looking for — personal, home, business or MSME?",
  "hi-IN": "माफ़ कीजिए, मैं ठीक से सुन नहीं पाई। आपको किस तरह का लोन चाहिए — पर्सनल, होम या बिज़नेस?",
  "mr-IN": "माफ करा, मला नीट ऐकू आले नाही. तुम्हाला कोणत्या प्रकारचे कर्ज हवे आहे — वैयक्तिक, गृह किंवा व्यवसाय?",
};

export interface AgentReply {
  text: string;
  endCall: boolean;
  transfer: boolean;
  language: VoiceLanguage;
}

/**
 * Detects the language of an utterance. Devanagari is shared by Hindi and
 * Marathi, so the two are separated with high-frequency function words.
 */
export function detectLanguage(text: string, fallback: VoiceLanguage = "en-IN"): VoiceLanguage {
  if (!/[\u0900-\u097F]/.test(text)) return "en-IN";

  let marathi = 0;
  let hindi = 0;
  for (const word of MARATHI_HINTS) if (text.includes(word)) marathi += 1;
  for (const word of HINDI_HINTS) if (text.includes(word)) hindi += 1;

  if (marathi === 0 && hindi === 0) return fallback === "en-IN" ? "hi-IN" : fallback;
  if (marathi > hindi) return "mr-IN";
  if (hindi > marathi) return "hi-IN";
  return fallback === "en-IN" ? "hi-IN" : fallback;
}

/** Strips everything a text-to-speech engine should not read aloud. */
export function sanitizeForSpeech(input: string): string {
  let text = input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[(END_CALL|TRANSFER)\]/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[*_#>`|~]/g, " ")
    .replace(/₹\s?/g, "rupees ")
    .replace(/%/g, " percent ")
    .replace(/&/g, " and ")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, " ")
    .replace(/[•·]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length > 380) {
    const cut = text.slice(0, 380);
    const lastStop = Math.max(cut.lastIndexOf("."), cut.lastIndexOf("?"), cut.lastIndexOf("!"));
    text = lastStop > 120 ? cut.slice(0, lastStop + 1) : `${cut.trim()}…`;
  }
  return text;
}

function geminiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
}

// gemini-1.5-flash is retired. Override with GEMINI_MODEL when a newer model
// becomes the better latency/quality trade-off for voice.
function geminiModel(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

// Gemini 2.5+ spends output budget on internal thinking, which both truncates
// the spoken line and adds ~1s of dead air. Voice turns run with it disabled.
function thinkingConfig(model: string): { thinkingConfig: { thinkingBudget: number } } | Record<string, never> {
  return /^gemini-(2\.5|[3-9])/.test(model) ? { thinkingConfig: { thinkingBudget: 0 } } : {};
}

function buildSystemPrompt(language: VoiceLanguage, contextString: string, name?: string): string {
  const persona = `You are "Sneha", a senior loan advisor at Speedy Loan Finance Services — a trusted loan DSA (Direct Selling Agent) and Andromeda partner based in Chinchwad, Pune, with access to 200+ banks and NBFCs and zero upfront fees.
You are speaking on a live telephone call with a customer${name ? ` named ${name}` : ""}. Everything you write is read aloud by a text-to-speech voice.`;

  const style = `CALL STYLE (non-negotiable):
- At most 2 short sentences, under 35 words total.
- Plain spoken words only: no markdown, no bullets, no emojis, no tables, no brackets, no digits with symbols.
- Always finish with one short question that moves the enquiry forward.
- Warm, confident, typically Indian business tone. Use "ji" at most once per call.
- Never invent interest rates, EMIs, eligibility or timelines beyond the retrieved context. If something is not covered, say a senior expert will call them back on this number.
- Never promise approval, never guarantee a rate.
- If the caller asks for a human, or sounds upset, append [TRANSFER] as the last token.
- If the call is naturally finished, append [END_CALL] as the last token.

COLLECT ONE AT A TIME (never as a list): loan type, amount, monthly income, employment type (salaried or self-employed), city, and approximate CIBIL score only if offered.`;

  const languageRule = `LANGUAGE RULE (mandatory): reply only in ${LANGUAGE_NAME[language]}. Do not mix in another language except unavoidable loan terms such as CIBIL, EMI, KYC, ITR, PAN, GST.`;

  const context = contextString
    ? `\n\n[RETRIEVED CONTEXT — the only source of product facts]\n${contextString}\n[/RETRIEVED CONTEXT]`
    : "";

  return `${persona}\n\n${style}\n\n${languageRule}${context}`;
}

export async function generateReply(params: {
  utterance: string;
  language: VoiceLanguage;
  history: AgentTurn[];
  name?: string;
}): Promise<AgentReply> {
  const { utterance, history, name } = params;
  const language = detectLanguage(utterance, params.language);

  const { contextString } = retrieve(utterance, 4);
  const apiKey = geminiKey();
  const model = geminiModel();

  if (!apiKey) {
    return { text: FALLBACK_REPLY[language], endCall: false, transfer: false, language };
  }

  const contents = [
    ...history.slice(-8).map((turn) => ({
      role: turn.role === "model" ? "model" : "user",
      parts: [{ text: turn.text }],
    })),
    { role: "user", parts: [{ text: utterance }] },
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        cache: "no-store",
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: buildSystemPrompt(language, contextString, name) }] },
          contents,
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 160,
            topP: 0.9,
            topK: 40,
            ...thinkingConfig(model),
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          ],
        }),
      }
    );

    if (!res.ok) {
      return { text: FALLBACK_REPLY[language], endCall: false, transfer: false, language };
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const raw =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join(" ")
        .trim() ?? "";

    if (!raw) {
      return { text: FALLBACK_REPLY[language], endCall: false, transfer: false, language };
    }

    const endCall = /\[END_CALL\]/.test(raw);
    const transfer = /\[TRANSFER\]/.test(raw);
    const text = sanitizeForSpeech(raw) || FALLBACK_REPLY[language];

    return { text, endCall, transfer, language };
  } catch {
    return { text: FALLBACK_REPLY[language], endCall: false, transfer: false, language };
  } finally {
    clearTimeout(timer);
  }
}

/** Opening line, kept short so the caller knows who is calling and why. */
export function greeting(language: VoiceLanguage, name?: string): string {
  const who = name ? ` ${name}जी` : "";
  switch (language) {
    case "hi-IN":
      return `नमस्कार${who}, मैं स्नेहा बोल रही हूँ, स्पीडी लोन फायनान्स सर्विसेस, चिंचवड, पुणे से। मैं आपकी लोन में मदद कर सकती हूँ। आपको किस तरह का लोन चाहिए — पर्सनल, होम, बिज़नेस या एमएसएमई?`;
    case "mr-IN":
      return `नमस्कार${who}, मी स्नेहा बोलतेय, स्पीडी लोन फायनान्स सर्व्हिसेस, चिंचवड, पुणे येथून. मी तुम्हाला कर्जासाठी मदत करू शकते. तुम्हाला कोणत्या प्रकारचे कर्ज हवे आहे — वैयक्तिक, गृह, व्यवसाय की एमएसएमई?`;
    default:
      return `Namaskar${who}, this is Sneha from Speedy Loan Finance Services, Chinchwad, Pune. I can help you with a loan today. Which loan are you looking for — personal, home, business or MSME?`;
  }
}

/** Re-prompt used when the caller stays silent. */
export function noInputPrompt(language: VoiceLanguage, attempt: number): string {
  if (attempt >= 2) {
    switch (language) {
      case "hi-IN":
        return "कोई बात नहीं, मैं बाद में कॉल करवा दूँगी। धन्यवाद, नमस्ते।";
      case "mr-IN":
        return "काही हरकत नाही, मी नंतर कॉल करून घेते. धन्यवाद, नमस्कार.";
      default:
        return "No problem, I will arrange a callback later. Thank you, goodbye.";
    }
  }
  switch (language) {
    case "hi-IN":
      return "क्या आप मुझे सुन सकते हैं? आपको किस तरह का लोन चाहिए?";
    case "mr-IN":
      return "तुम्हाला माझा आवाज ऐकू येतोय का? तुम्हाला कोणत्या प्रकारचे कर्ज हवे आहे?";
    default:
      return "Can you hear me? Which type of loan do you need?";
  }
}
