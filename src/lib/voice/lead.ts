// -----------------------------------------------------------------------------
// Lead analysis
//
// Turns a finished call transcript into the structured brief a bank loan officer
// would write: who the customer is, what they need, what they earn, what they
// already owe, and how that affects eligibility (FOIR).
// -----------------------------------------------------------------------------

import type { AgentTurn } from "./state";

export interface LeadAnalysis {
  customerType: string;
  loanType: string;
  amountRequired: string;
  monthlyIncome: string;
  existingObligations: string;
  employmentDetails: string;
  city: string;
  cibil: string;
  foir: string;
  intent: "Hot" | "Warm" | "Cold";
  score: number;
  summary: string;
  recommendedProducts: string[];
  nextAction: string;
}

export const EMPTY_ANALYSIS: LeadAnalysis = {
  customerType: "Unknown",
  loanType: "Not shared",
  amountRequired: "Not shared",
  monthlyIncome: "Not shared",
  existingObligations: "Not shared",
  employmentDetails: "Not shared",
  city: "Not shared",
  cibil: "Not shared",
  foir: "Not calculated",
  intent: "Cold",
  score: 0,
  summary: "Call ended before the requirement was captured.",
  recommendedProducts: [],
  nextAction: "Call back to complete the enquiry.",
};

const UNIT: Record<string, number> = {
  crore: 1e7,
  cr: 1e7,
  lakh: 1e5,
  lakhs: 1e5,
  lac: 1e5,
  lacs: 1e5,
  thousand: 1e3,
  k: 1e3,
};

/** "5 lakh" -> 500000, "1.5 cr" -> 15000000, "45,000" -> 45000. */
export function parseIndianAmount(text: string): number | null {
  const cleaned = text.toLowerCase().replace(/,/g, "");

  const withUnit = cleaned.match(/(\d+(?:\.\d+)?)\s*(crore|cr|lakhs|lakh|lacs|lac|thousand|k)\b/);
  if (withUnit) {
    const value = Number(withUnit[1]);
    const multiplier = UNIT[withUnit[2]] ?? 1;
    return Number.isFinite(value) ? Math.round(value * multiplier) : null;
  }

  const plain = cleaned.match(/\b(\d{4,9})\b/);
  if (plain) {
    const value = Number(plain[1]);
    return Number.isFinite(value) && value >= 1000 ? value : null;
  }
  return null;
}

export function formatInr(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Not shared";
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(2).replace(/\.00$/, "")} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

/** LLMs return strings, numbers, arrays or nested objects for the same field. */
function asText(value: unknown, max = 80): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim().slice(0, max);
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => asText(item, max))
      .filter(Boolean)
      .join("; ")
      .slice(0, max);
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key}: ${asText(item, 40)}`)
      .join(", ")
      .slice(0, max);
  }
  return "";
}

/** Turns 500000 into "₹5 L", keeps "₹5 L" as-is. */
function moneyText(value: unknown): string {
  const text = asText(value, 60);
  if (!text) return "";
  if (/[₹a-z]/i.test(text)) return text;
  const numeric = Number(text.replace(/[^\d.]/g, ""));
  if (Number.isFinite(numeric) && numeric >= 1000) return formatInr(numeric);
  return text;
}

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40,
  fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

/** "five lakh" -> 500000, "forty five thousand" -> 45000. */
function parseWordAmount(text: string): number | null {
  const tokens = text.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);

  for (let i = 0; i < tokens.length; i += 1) {
    const unit = UNIT[tokens[i]];
    if (!unit) continue;

    let value = 0;
    let seen = false;
    for (let j = i - 1; j >= 0 && j >= i - 3; j -= 1) {
      const word = tokens[j];
      if (WORD_NUMBERS[word] !== undefined) {
        value += WORD_NUMBERS[word];
        seen = true;
      } else if (word === "hundred") {
        value = (value || 1) * 100;
        seen = true;
      } else if (word === "and") {
        continue;
      } else break;
    }
    if (seen && value > 0) return Math.round(value * unit);
  }
  return null;
}

/** Digits first, then spoken numbers. */
function parseAmountAny(text: string): number | null {
  return parseIndianAmount(text) ?? parseWordAmount(text);
}

function guessCustomerType(text: string): string {
  const t = text.toLowerCase();
  if (/(doctor|dentist|lawyer|advocate|architect|chartered accountant|\bca\b|consultant)/.test(t))
    return "Self-employed professional";
  if (/(business|shop|proprietor|firm|company owner|manufactur|trader|msme|factory|dukan)/.test(t))
    return "Business owner";
  if (/(salaried|salary|job|employee|working in|mnc|private limited|govt|government)/.test(t))
    return "Salaried";
  if (/(self.employed|freelanc|contractor)/.test(t)) return "Self-employed";
  return "Unknown";
}

function guessCity(text: string): string {
  const cities = [
    "Pune", "Chinchwad", "Pimpri", "Wakad", "Hinjawadi", "Ravet", "Bhosari", "Nigdi",
    "Mumbai", "Thane", "Navi Mumbai", "Nashik", "Nagpur", "Aurangabad", "Satara",
    "Kolhapur", "Solapur", "Sangli", "Ahmednagar", "Delhi", "Bangalore", "Hyderabad",
  ];
  const found = cities.filter((city) => new RegExp(`\\b${city}\\b`, "i").test(text));
  return found.slice(0, 2).join(", ") || "Not shared";
}

function guessCibil(text: string): string {
  const match = text.match(/(?:cibil|credit score)[^\d]{0,20}(\d{3})/i) ?? text.match(/\b([3-9]\d{2})\b/);
  return match ? match[1] : "Not shared";
}

/** Deterministic fallback when the model is unavailable (quota, outage). */
export function heuristicAnalysis(history: AgentTurn[]): LeadAnalysis {
  const userText = history
    .filter((turn) => turn.role === "user")
    .map((turn) => turn.text)
    .join(" . ");

  if (!userText.trim()) return { ...EMPTY_ANALYSIS };

  const lower = userText.toLowerCase();
  const customerType = guessCustomerType(userText);
  const city = guessCity(userText);
  const cibil = guessCibil(userText);

  const sentences = lower.split(/[.!?।]/).map((part) => part.trim()).filter(Boolean);

  const amountSentence = sentences.find(
    (part) =>
      /(lakh|lakhs|lac|crore|cr\b|thousand|rupees|rs\.?|₹)/.test(part) &&
      !/(income|salary|earning|emi|obligation|instal?ment|per month)/.test(part)
  );
  const incomeSentence =
    sentences.find((part) => /(income|salary|earning|kamai|pagar|per month)/.test(part)) ?? "";
  const obligationSentence =
    sentences.find((part) => /(emi|obligation|running loan|instal?ment)/.test(part)) ?? "";

  const amount = amountSentence ? parseAmountAny(amountSentence) : null;
  const income = incomeSentence ? parseAmountAny(incomeSentence) : null;

  const saysNoObligations = /(no loan|no emi|nothing running|कोई लोन नहीं|कोणतेही कर्ज नाही|\bnil\b)/i.test(userText);
  const obligationValue = saysNoObligations ? 0 : obligationSentence ? parseAmountAny(obligationSentence) : null;

  const foirValue =
    income && income > 0 && obligationValue !== null ? Math.round((obligationValue / income) * 100) : null;

  const hasAmount = amount !== null;
  const hasIncome = income !== null;
  const hasObligations = saysNoObligations || obligationValue !== null;

  let score = 35;
  if (hasAmount) score += 15;
  if (hasIncome) score += 20;
  if (hasObligations) score += 15;
  if (customerType !== "Unknown") score += 10;
  if (foirValue !== null && foirValue > 50) score -= 20;
  if (foirValue !== null && foirValue <= 40) score += 10;
  score = Math.max(0, Math.min(100, score));

  const intent: LeadAnalysis["intent"] = score >= 75 ? "Hot" : score >= 50 ? "Warm" : "Cold";

  return {
    customerType,
    loanType: /(home|griha|ghar)/i.test(userText)
      ? "Home loan"
      : /(business|vyapar|dukan)/i.test(userText)
        ? "Business loan"
        : /(msme)/i.test(userText)
          ? "MSME loan"
          : /(property|lap|mortgage)/i.test(userText)
            ? "Loan against property"
            : /(personal|vyaktigat)/i.test(userText)
              ? "Personal loan"
              : "Not shared",
    amountRequired: formatInr(amount),
    monthlyIncome: formatInr(income),
    existingObligations: saysNoObligations
      ? "None declared"
      : obligationValue !== null
        ? `${formatInr(obligationValue)} per month`
        : "Not shared",
    employmentDetails: customerType === "Unknown" ? "Not shared" : customerType,
    city,
    cibil,
    foir: foirValue !== null ? `${foirValue}%` : "Not calculated",
    intent,
    score,
    summary: userText.slice(0, 220),
    recommendedProducts: [],
    nextAction:
      intent === "Cold"
        ? "Call back to complete the requirement."
        : "Assign to a loan advisor and confirm documents.",
  };
}

function geminiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
}

function geminiModel(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

/** Calls Gemini in JSON mode; falls back to heuristics on any failure. */
export async function analyseLead(history: AgentTurn[], name: string): Promise<LeadAnalysis> {
  const fallback = heuristicAnalysis(history);
  const apiKey = geminiKey();

  const transcript = history
    .slice(-20)
    .map((turn) => `${turn.role === "user" ? "Customer" : "Sneha"}: ${turn.text}`)
    .join("\n");

  if (!apiKey || !transcript.trim()) return fallback;

  const schema = `{
  "customerType": "Salaried | Business owner | Self-employed | Self-employed professional | Unknown",
  "loanType": "Personal loan | Home loan | Business loan | MSME loan | Loan against property | Balance transfer | Not shared",
  "amountRequired": "short string with currency, e.g. ₹5 L",
  "monthlyIncome": "short string, e.g. ₹45,000",
  "existingObligations": "short string describing running EMIs, or 'None declared'",
  "employmentDetails": "one line: employer/business, role, vintage if stated",
  "city": "city or area, or Not shared",
  "cibil": "score if stated, else Not shared",
  "foir": "existing obligations as a percentage of income, e.g. 18%, or Not calculated",
  "intent": "Hot | Warm | Cold",
  "score": 0,
  "summary": "two sentences, factual, no sales language",
  "recommendedProducts": ["up to three concrete loan products"],
  "nextAction": "one short instruction for the human advisor"
}`;

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
                text: `You are a senior credit analyst at an Indian loan DSA. Read the call transcript and return ONLY a JSON object matching this shape:
${schema}
Rules: use the customer's own facts; never invent numbers. "score" is 0-100 for how ready this lead is to apply (income + requirement + no excessive obligations = higher). If the customer is salaried and has no running EMIs, say so explicitly in existingObligations. Keep each string under 14 words. No markdown, no commentary.`,
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: `Customer name: ${name || "not shared"}\n\nTranscript:\n${transcript}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 700,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                customerType: { type: "STRING" },
                loanType: { type: "STRING" },
                amountRequired: { type: "STRING" },
                monthlyIncome: { type: "STRING" },
                existingObligations: { type: "STRING" },
                employmentDetails: { type: "STRING" },
                city: { type: "STRING" },
                cibil: { type: "STRING" },
                foir: { type: "STRING" },
                intent: { type: "STRING" },
                score: { type: "INTEGER" },
                summary: { type: "STRING" },
                recommendedProducts: { type: "ARRAY", items: { type: "STRING" } },
                nextAction: { type: "STRING" },
              },
              required: [
                "customerType", "loanType", "amountRequired", "monthlyIncome",
                "existingObligations", "employmentDetails", "city", "cibil",
                "foir", "intent", "score", "summary", "recommendedProducts", "nextAction"
              ],
            },
            ...(/^gemini-(2\.5|[3-9])/.test(geminiModel())
              ? { thinkingConfig: { thinkingBudget: 0 } }
              : {}),
          },
        }),
      }
    );

    if (!res.ok) return fallback;

    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const raw = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
    if (!raw.trim()) return fallback;

    const parsed = JSON.parse(raw) as Partial<LeadAnalysis>;
    const score = Number(parsed.score);

    return {
      customerType: asText(parsed.customerType, 60) || fallback.customerType,
      loanType: asText(parsed.loanType, 60) || fallback.loanType,
      amountRequired: moneyText(parsed.amountRequired) || fallback.amountRequired,
      monthlyIncome: moneyText(parsed.monthlyIncome) || fallback.monthlyIncome,
      existingObligations: asText(parsed.existingObligations, 90) || fallback.existingObligations,
      employmentDetails: asText(parsed.employmentDetails, 110) || fallback.employmentDetails,
      city: asText(parsed.city, 60) || fallback.city,
      cibil: asText(parsed.cibil, 20) || fallback.cibil,
      foir: asText(parsed.foir, 20) || fallback.foir,
      intent:
        parsed.intent === "Hot" || parsed.intent === "Warm" || parsed.intent === "Cold"
          ? parsed.intent
          : fallback.intent,
      score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : fallback.score,
      summary: asText(parsed.summary, 260) || fallback.summary,
      recommendedProducts: Array.isArray(parsed.recommendedProducts)
        ? parsed.recommendedProducts.map((item) => asText(item, 60)).filter(Boolean).slice(0, 3)
        : fallback.recommendedProducts,
      nextAction: asText(parsed.nextAction, 160) || fallback.nextAction,
    };
  } catch {
    return fallback;
  }
}

/** Plain-text brief used for the WhatsApp message. */
export function formatLeadMessage(params: {
  name: string;
  phone: string;
  language: string;
  analysis: LeadAnalysis;
}): string {
  const { name, phone, language, analysis: a } = params;
  return [
    "*New loan enquiry — AI call*",
    "",
    `Name: ${name || "not shared"}`,
    `Phone: ${phone || "not shared"}`,
    `Language: ${language}`,
    `Customer type: ${a.customerType}`,
    `Loan: ${a.loanType} — ${a.amountRequired}`,
    `Income: ${a.monthlyIncome}`,
    `Obligations: ${a.existingObligations}`,
    `FOIR: ${a.foir}`,
    `City: ${a.city}`,
    `CIBIL: ${a.cibil}`,
    "",
    `Intent: ${a.intent} (score ${a.score}/100)`,
    a.recommendedProducts.length ? `Fit: ${a.recommendedProducts.join(", ")}` : "",
    `Next: ${a.nextAction}`,
    "",
    `_${a.summary}_`,
  ]
    .filter(Boolean)
    .join("\n");
}
