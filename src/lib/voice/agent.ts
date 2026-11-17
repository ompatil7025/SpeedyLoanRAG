// -----------------------------------------------------------------------------
// Voice agent brain
//
// Scripted opening (name -> time-of-day greeting -> company + office ->
// "do you need any loan?"), then a Gemini-driven qualification, ending with the
// lead pushed to WhatsApp.
// -----------------------------------------------------------------------------

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
  sendLead: boolean;
  language: VoiceLanguage;
}

/** Current hour in India (Asia/Kolkata), independent of server timezone. */
export function istHour(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    hour12: false,
  }).format(new Date());
  const hour = Number(parts);
  return Number.isFinite(hour) ? hour % 24 : 10;
}

/** Morning / afternoon / evening greeting for the caller's language. */
export function timeGreeting(lang: VoiceLanguage, hour = istHour()): string {
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 17;
  const isEvening = hour >= 17 && hour < 21;

  if (lang === "hi-IN") {
    if (isMorning) return "सुप्रभात";
    if (isEvening) return "शुभ संध्या";
    return "नमस्कार";
  }
  if (lang === "mr-IN") {
    if (isMorning) return "शुभ सकाळ";
    if (isEvening) return "शुभ संध्याकाळ";
    return "नमस्कार";
  }
  if (isMorning) return "Good morning";
  if (isAfternoon) return "Good afternoon";
  if (isEvening) return "Good evening";
  return "Good evening";
}

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

export function sanitizeForSpeech(input: string): string {
  let text = input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[(END_CALL|TRANSFER|SEND_LEAD)\]/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\*\*/g, "")
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

// ---------------------------------------------------------------------------
// Scripted opening
// ---------------------------------------------------------------------------

export function askNamePrompt(lang: VoiceLanguage): string {
  switch (lang) {
    case "hi-IN":
      return "नमस्कार! स्पीडी लोन फायनान्स सर्विसेस से बोल रही हूँ। क्या मैं आपका पहला नाम जान सकती हूँ?";
    case "mr-IN":
      return "नमस्कार! स्पीडी लोन फायनान्स सर्व्हिसेस मधून बोलतेय. मी तुमचे पहिले नाव जाणून घेऊ शकते का?";
    default:
      return "Namaskar! I am calling from Speedy Loan Finance Services. May I know your first name, please?";
  }
}

/** Second line: time greeting + company + verifiable office + polite loan ask. */
export function introScript(lang: VoiceLanguage, name: string, hour = istHour()): string {
  const greet = timeGreeting(lang, hour);
  const who = name.trim();

  if (lang === "hi-IN") {
    return `${greet} ${who ? `${who} जी` : "सर"}, मैं स्नेहा बोल रही हूँ, स्पीडी लोन फायनान्स सर्विसेस से। हमारा ऑफिस चिंचवड, पुणे में मायूर ट्रेड सेंटर, चिंचवड रेलवे स्टेशन के पास है — आप कभी भी वेरिफाई कर सकते हैं। सर, क्या आपको किसी तरह के लोन की ज़रूरत है?`;
  }
  if (lang === "mr-IN") {
    return `${greet} ${who ? `${who} जी` : "सर"}, मी स्नेहा बोलतेय, स्पीडी लोन फायनान्स सर्व्हिसेस मधून. आमचे ऑफिस चिंचवड, पुणे येथे मायूर ट्रेड सेंटर, चिंचवड रेल्वे स्टेशन जवळ आहे — तुम्ही कधीही खात्री करू शकता. सर, तुम्हाला कोणत्या प्रकारचे कर्ज हवे आहे का?`;
  }
  return `${greet}${who ? ` ${who} ji` : " sir"}, I am Sneha calling from Speedy Loan Finance Services. Our office is at Mayur Trade Center, near Chinchwad Railway Station, Pune — you are welcome to verify it anytime. Sir, do you need any type of loan?`;
}

/** Pulls a first name out of a free-form answer like "Yes, my name is Rahul". */
export function extractName(utterance: string): string {
  const STOP = /^(sir|madam|yes|no|haan|nahi|hello|hi|हो|नाही|नमस्कार|नमस्ते)$/i;

  const capitalise = (word: string) => {
    const trimmed = word.replace(/[^\p{L}\p{M}'.-]/gu, "");
    if (!trimmed) return "";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  // Prefer an explicit introduction anywhere in the sentence.
  const explicit = utterance.match(
    /(?:my name is|i am|i'?m|this is|it'?s|mera naam hai|mera naam|मेरा नाम है|मेरा नाम|माझं नाव आहे|माझं नाव|माझे नाव|मी)\s+([\p{L}\p{M}][\p{L}\p{M}'.-]{1,19})/iu
  );
  if (explicit) {
    const name = capitalise(explicit[1]);
    if (name.length >= 2) return name;
  }

  // Otherwise take the first meaningful word they said.
  const words = utterance
    .replace(/[^\p{L}\p{M}\s'.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  for (const word of words.slice(0, 3)) {
    if (STOP.test(word)) continue;
    const name = capitalise(word);
    if (name.length >= 2) return name;
  }
  return "";
}

// ---------------------------------------------------------------------------
// Gemini
// ---------------------------------------------------------------------------

function geminiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
}

function geminiModel(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

function thinkingConfig(model: string): { thinkingConfig: { thinkingBudget: number } } | Record<string, never> {
  return /^gemini-(2\.5|[3-9])/.test(model) ? { thinkingConfig: { thinkingBudget: 0 } } : {};
}

function buildSystemPrompt(params: {
  language: VoiceLanguage;
  contextString: string;
  name?: string;
  greeted: boolean;
  leadSent?: boolean;
}): string {
  const { language, contextString, name, greeted, leadSent } = params;

  const persona = `You are "Sneha", a senior loan advisor at Speedy Loan Finance Services — a trusted loan DSA and Andromeda partner in Chinchwad, Pune, with access to 200+ banks and NBFCs and zero upfront fees.
You are on a live telephone call with ${name ? `${name} ji` : "a customer"}. Everything you write is read aloud.`;

  const stage = greeted
    ? `The opening is already done: you greeted them by name and time of day, introduced Speedy Loan Finance Services and the Chinchwad office, and asked whether they need a loan. Continue from there — never repeat the greeting or the company introduction.`
    : `You may still need to introduce yourself briefly.`;

  const style = `CALL STYLE (non-negotiable):
- At most 2 short sentences, under 35 words total.
- Plain spoken words only: no markdown, bullets, emojis, tables, brackets or rupee symbols.
- Always end with one short question that moves the enquiry forward.
- Warm, respectful, professional Indian business tone. Address them as "sir" or by name with "ji".
- Never invent interest rates, EMIs, eligibility or timelines beyond the retrieved context. If something is not covered, say a senior expert will call them back on this number.
- Never promise approval or guarantee a rate.

QUALIFICATION ORDER — collect one item per turn, never as a list:
1. what kind of loan (personal, home, business, MSME, loan against property, balance transfer)
2. how much they need
3. monthly income
4. salaried or self-employed
5. city or area
6. approximate CIBIL score, only if they offer it

WHEN YOU HAVE THE LOAN TYPE AND AT LEAST THE AMOUNT:
- Confirm the requirement back to them in one sentence.
- Tell them you are sharing their details with the Speedy Loan team on WhatsApp right now, and that an advisor will call them back shortly.
- Append [SEND_LEAD] as the last token, exactly once in the call.
- After that, ask if they need help with anything else.

OTHER TOKENS:
- If they ask for a human, or sound upset, append [TRANSFER].
- If the call is naturally finished (they say thanks or bye), append [END_CALL].
- If they clearly do not need a loan, politely close and append [END_CALL].`;

  const whatsappNote = leadSent
    ? `\n\nThe lead has ALREADY been sent to the Speedy Loan team on WhatsApp. Never say you are sending or sharing details again. If asked, confirm the team already has them and will call back shortly.`
    : "";

  const languageRule = `LANGUAGE RULE (mandatory): reply only in ${LANGUAGE_NAME[language]}. Do not mix another language except unavoidable loan terms such as CIBIL, EMI, KYC, ITR, PAN, GST.`;

  const context = contextString
    ? `\n\n[RETRIEVED CONTEXT — the only source of product facts]\n${contextString}\n[/RETRIEVED CONTEXT]`
    : "";

  return `${persona}\n\n${stage}\n\n${style}${whatsappNote}\n\n${languageRule}${context}`;
}

export async function generateReply(params: {
  utterance: string;
  language: VoiceLanguage;
  history: AgentTurn[];
  name?: string;
  leadSent?: boolean;
}): Promise<AgentReply> {
  const { utterance, history, name, leadSent } = params;
  const language = detectLanguage(utterance, params.language);

  const { contextString } = retrieve(utterance, 4);
  const apiKey = geminiKey();

  if (!apiKey) {
    return { text: FALLBACK_REPLY[language], endCall: false, transfer: false, sendLead: false, language };
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
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        cache: "no-store",
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: buildSystemPrompt({
                  language,
                  contextString,
                  name,
                  greeted: history.length > 0,
                  leadSent,
                }),
              },
            ],
          },
          contents,
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 160,
            topP: 0.9,
            topK: 40,
            ...thinkingConfig(geminiModel()),
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          ],
        }),
      }
    );

    if (!res.ok) {
      return { text: FALLBACK_REPLY[language], endCall: false, transfer: false, sendLead: false, language };
    }

    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const raw =
      data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join(" ").trim() ?? "";

    if (!raw) {
      return { text: FALLBACK_REPLY[language], endCall: false, transfer: false, sendLead: false, language };
    }

    const endCall = /\[END_CALL\]/.test(raw);
    const transfer = /\[TRANSFER\]/.test(raw);
    const sendLead = /\[SEND_LEAD\]/.test(raw);
    const text = sanitizeForSpeech(raw) || FALLBACK_REPLY[language];

    return { text, endCall, transfer, sendLead, language };
  } catch {
    return { text: FALLBACK_REPLY[language], endCall: false, transfer: false, sendLead: false, language };
  } finally {
    clearTimeout(timer);
  }
}

/** Condenses the transcript into a short WhatsApp brief for the sales team. */
export async function summariseLead(history: AgentTurn[], name: string): Promise<string> {
  const apiKey = geminiKey();
  const transcript = history
    .slice(-14)
    .map((turn) => `${turn.role === "user" ? "Customer" : "Sneha"}: ${turn.text}`)
    .join("\n");

  const fallback = history
    .filter((turn) => turn.role === "user")
    .slice(-3)
    .map((turn) => `• ${turn.text}`)
    .join("\n");

  if (!apiKey || !transcript) return fallback;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `Extract the loan enquiry from this phone call as plain text, one field per line, using "Label: value" and writing "not shared" when the customer did not say. Labels, in this order: Loan type, Amount needed, Monthly income, Employment, City or area, CIBIL score, Intent. Keep every value under 12 words. No markdown, no extra commentary.`,
              },
            ],
          },
          contents: [{ role: "user", parts: [{ text: `Customer name: ${name || "not shared"}\n\n${transcript}` }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 200,
            ...thinkingConfig(geminiModel()),
          },
        }),
      }
    );

    if (!res.ok) return fallback;
    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join(" ").trim();
    return text || fallback;
  } catch {
    return fallback;
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
