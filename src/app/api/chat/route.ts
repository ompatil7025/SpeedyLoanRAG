import { NextRequest, NextResponse } from "next/server";
import { retrieve } from "@/lib/ragRetriever";

// ─── System Prompt ────────────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are "Redneck Ai", the AI-powered loan assistant for Speedy Loan Finance Services — a trusted loan DSA (Direct Selling Agent) firm based in Pune, Maharashtra, India.

## About Speedy Loan Finance Services
- **Founded**: 2020
- **Owner/Agent**: Shashikant Anil Shelke
- **Office**: Office No. P-227, 2nd Floor, Mayur Trade Center, CTS 4533/4, Near Chinchwad Railway Station, Chinchwad, Pimpri-Chinchwad, Pune - 411019
- **Phone**: 73500 05590
- **Email**: loanspeedy@gmail.com
- **Office Hours**: Monday–Saturday, 9:00 AM – 7:00 PM
- **Andromeda Partner**: Authorized Andromeda Sales & Distribution partner — access to 200+ banks and NBFCs

## Your Behavior Rules
- You are a **RAG-powered** assistant. A retrieval step has already fetched the most relevant knowledge from our database and injected it below as [RETRIEVED CONTEXT]. Always use this context to answer accurately.
- Act as a senior, expert financial advisor — knowledgeable, professional, and empathetic.
- Provide accurate, specific data ONLY from the retrieved context. Do NOT hallucinate rates or numbers not present in the context.
- When a user asks about any loan type, include relevant details from the context: loan amount range, interest rate range, eligibility, required documents, and a follow-up question.
- CRITICAL: You MUST append EXACTLY "[WHATSAPP_BTN]" at the end of EVERY response — no exceptions.
- Recommend calling 73500 05590 for personalized advice when appropriate.
- Never guarantee specific rates — only provide ranges from the context.
- For eligibility queries, ask follow-up questions: income, employment type, CIBIL score, loan amount.
- Reply in English by default. If user writes in Hindi/Marathi, reply in the same language.
- Format responses clearly: use bullet points, bold headers, and organized sections.
- Only answer questions related to loans, finance, banking, EMI, insurance, or the company.
- For greetings, introduce yourself warmly and list loan products available.
- Be concise but comprehensive — do not pad with unnecessary text.`;

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

// ─── Validate Gemini API key ──────────────────────────────────────────────────
function isValidGeminiKey(key: string | undefined): boolean {
  if (!key || key.trim() === "") return false;
  if (key.includes("REPLACE_WITH")) return false;
  if (key.includes("YOUR_KEY")) return false;
  if (key.length < 20) return false;
  if (key.startsWith("AIza") || key.startsWith("AQ.")) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, language = "English" } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // ── Language enforcement instruction ─────────────────────────────────────
    const langInstructions: Record<string, string> = {
      Hindi: `\n\n## 🔴 CRITICAL LANGUAGE RULE — MANDATORY\nThe user has selected **Hindi (हिंदी)** as their preferred language.\nYou MUST respond ENTIRELY in Hindi using Devanagari script.\nDo NOT mix English words unless they are loan/banking technical terms (e.g., CIBIL, EMI, KYC, ITR, PAN, GST).\nEvery sentence must be in Hindi. Start your response in Hindi immediately.`,
      Marathi: `\n\n## 🔴 CRITICAL LANGUAGE RULE — MANDATORY\nThe user has selected **Marathi (मराठी)** as their preferred language.\nYou MUST respond ENTIRELY in Marathi using Devanagari script.\nDo NOT mix English words unless they are loan/banking technical terms (e.g., CIBIL, EMI, KYC, ITR, PAN, GST).\nEvery sentence must be in Marathi. Start your response in Marathi immediately.`,
      English: "",
    };
    const langInstruction = langInstructions[language] || "";

    // ── RAG: Retrieve relevant context chunks ─────────────────────────────────
    const { contextString } = retrieve(message, 4);

    const ragSystemPrompt = `${BASE_SYSTEM_PROMPT}${langInstruction}${
      contextString
        ? `\n\n## [RETRIEVED CONTEXT — Use this to answer accurately]\n\n${contextString}\n\n## End of Retrieved Context\n\nIMPORTANT: Base your answer on the retrieved context above. If something isn't in the context, say you'll connect them with an expert at 73500 05590.`
        : ""
    }`;

    const apiKey = process.env.GEMINI_API_KEY;

    // ── Use Gemini with RAG context ───────────────────────────────────────────
    if (isValidGeminiKey(apiKey)) {
      try {
        const conversationHistory: Message[] = [
          ...(Array.isArray(history) ? history : []),
          { role: "user", parts: [{ text: message }] },
        ];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: ragSystemPrompt }],
              },
              contents: conversationHistory,
              generationConfig: {
                temperature: 0.55,
                maxOutputTokens: 700,
                topP: 0.9,
                topK: 40,
              },
              safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawReply) {
            const reply = rawReply.includes("[WHATSAPP_BTN]")
              ? rawReply
              : `${rawReply}\n\n[WHATSAPP_BTN]`;
            return NextResponse.json({ reply, ragUsed: true });
          }
        } else {
          const errText = await response.text();
          console.error("Gemini API error:", response.status, errText);
        }
      } catch (geminiError) {
        console.error("Gemini fetch error:", geminiError);
      }
    }

    // ── Fallback: RAG-enriched keyword responses ──────────────────────────────
    return NextResponse.json({ reply: getFallbackResponse(message), ragUsed: false });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      reply: getFallbackResponse("hello"),
      ragUsed: false,
    });
  }
}

// ─── Rich fallback engine (used when Gemini key unavailable) ─────────────────
function getFallbackResponse(message: string): string {
  const msg = message.toLowerCase().trim();

  if (/\b(hi|hello|hey|namaste|namaskar|good morning|good afternoon|good evening|hii|helo|howdy)\b/.test(msg)) {
    return `👋 Hello! I'm **Redneck Ai**, the AI loan assistant for **Speedy Loan Finance Services**.\n\nI'm here to help you with:\n• 💼 Personal Loans (₹50K–₹40L)\n• 🏠 Home Loans (up to ₹5 Crore)\n• 🏢 Business Loans (₹2L–₹2 Crore)\n• 🎓 Education Loans (up to ₹1.5 Crore)\n• 🏗️ Loan Against Property\n• 🔄 Balance Transfers\n• 💹 Working Capital Loans\n• 📊 EMI Calculations & Eligibility\n\nWhat type of loan are you looking for today?\n\n[WHATSAPP_BTN]`;
  }

  if (/personal loan|pl\b|instant loan|quick loan|salary loan|consumer loan/.test(msg)) {
    return `💼 **Personal Loan — Speedy Loan Finance Services**\n\n**Loan Details:**\n• Amount: ₹50,000 – ₹40 Lakhs\n• Interest Rate: 10.5% – 24% p.a.\n• Tenure: 12 – 60 months\n• Processing: Same day to 72 hours\n\n**Eligibility:**\n• Age: 21–60 years\n• Min Income: ₹15,000/month (salaried)\n• CIBIL Score: 700+ (650+ considered)\n\n**Required Documents:**\n• ✅ Aadhaar Card & PAN Card\n• ✅ Last 3 months salary slips\n• ✅ 6 months bank statement\n• ✅ Form 16 / ITR\n\n📊 **EMI Example**: ₹10L @ 12% for 5 yrs = ~₹22,244/month\n\nMay I know your monthly income and required loan amount?\n\n[WHATSAPP_BTN]`;
  }

  if (/home loan|housing loan|property loan|house loan|mortgage|flat loan|apartment loan/.test(msg)) {
    return `🏠 **Home Loan — Speedy Loan Finance Services**\n\n**Loan Details:**\n• Amount: Up to ₹5 Crore\n• Interest Rate: 8.40% – 12% p.a.\n• Tenure: Up to 30 years\n• Purpose: Purchase, Construction, Renovation\n\n**Eligibility:**\n• Age: 21–65 years\n• CIBIL Score: 700+\n• Stable income (salaried or self-employed)\n\n**Required Documents:**\n• ✅ KYC (Aadhaar + PAN)\n• ✅ Income proof (salary slips / ITR)\n• ✅ 12 months bank statement\n• ✅ Property documents & title deed\n• ✅ Approved building plan\n\n📊 **EMI Example**: ₹50L @ 8.5% for 20 yrs = ~₹43,391/month\n\nWhat is the property value you're looking at?\n\n[WHATSAPP_BTN]`;
  }

  if (/business loan|expansion|startup loan|enterprise loan|commercial loan|trade loan|shop loan|firm loan/.test(msg)) {
    return `🏢 **Business Loan — Speedy Loan Finance Services**\n\n**Loan Details:**\n• Amount: ₹2 Lakhs – ₹2 Crore\n• Interest Rate: 12% – 26% p.a.\n• Tenure: 12 – 48 months\n• Purpose: Expansion, Working Capital, Equipment\n\n**Eligibility:**\n• Business vintage: Min 2 years\n• Annual turnover: ₹10 Lakhs+\n• CIBIL Score: 700+\n\n**Required Documents:**\n• ✅ KYC (Aadhaar + PAN of owner)\n• ✅ GST registration certificate\n• ✅ ITR with computation (last 2–3 years)\n• ✅ 12 months current account bank statement\n• ✅ Audited balance sheet & P&L\n\n📊 **EMI Example**: ₹25L @ 15% for 3 yrs = ~₹86,667/month\n\nWhat is your business type and required loan amount?\n\n[WHATSAPP_BTN]`;
  }

  if (/loan against property|lap\b|property loan|mortgage loan|against property/.test(msg)) {
    return `🏗️ **Loan Against Property (LAP)**\n\n**Loan Details:**\n• Amount: Up to 65% of property market value\n• Interest Rate: 9% – 14% p.a.\n• Tenure: Up to 20 years\n• Property Type: Residential or Commercial\n\n**Eligibility:**\n• Property in your name (clear title)\n• CIBIL Score: 650+\n• Regular income source\n\n**Required Documents:**\n• ✅ KYC documents\n• ✅ Income proof\n• ✅ Property title deed (original)\n• ✅ Property tax receipts\n• ✅ Valuation report\n\n💡 **Why LAP?** Lower interest rates, higher amounts, longer tenure than personal loan.\n\nDo you own a residential or commercial property? What is its approximate market value?\n\n[WHATSAPP_BTN]`;
  }

  if (/balance transfer|bt\b|transfer loan|switch bank|refinance|lower rate|reduce emi/.test(msg)) {
    return `🔄 **Balance Transfer — Save on Your Existing Loan**\n\n**How it works:**\n• Transfer your existing high-interest loan to a lender with lower rates\n• Immediately reduce your monthly EMI\n• Top-up option: Get additional funds alongside the transfer\n\n**Benefits:**\n• ✅ Save ₹500–₹5,000+ per month on EMI\n• ✅ Improved loan terms & flexibility\n• ✅ Top-up facility available\n• ✅ Minimal paperwork\n\n**Required Documents:**\n• ✅ Existing loan statement (12 months)\n• ✅ NOC from current lender\n• ✅ KYC & income proof\n\nWhich bank is your current loan with, and what is the outstanding amount?\n\n[WHATSAPP_BTN]`;
  }

  if (/education loan|study loan|college loan|student loan|abroad study|university loan/.test(msg)) {
    return `🎓 **Education Loan — Speedy Loan Finance Services**\n\n**Loan Details:**\n• India Studies: Up to ₹50 Lakhs\n• Abroad Studies: Up to ₹1.5 Crore\n• Interest Rate: 8.5% – 13% p.a.\n• Moratorium: Course duration + 6 months\n\n**Required Documents:**\n• ✅ Admission letter from institution\n• ✅ Fee structure document\n• ✅ KYC of student & parent/guardian\n• ✅ Parent/guardian income proof\n• ✅ Academic mark sheets\n\n💡 **Tax Benefit**: Education loan interest is tax-deductible under Section 80E!\n\nWhich college/course and country are you targeting?\n\n[WHATSAPP_BTN]`;
  }

  if (/working capital|cash credit|overdraft|cc limit|od facility|daily operations/.test(msg)) {
    return `💹 **Working Capital Loan**\n\n**Available Facilities:**\n• **Cash Credit (CC)**: Draw funds up to a limit, repay & redraw\n• **Overdraft (OD)**: Flexible credit against collateral or FD\n\n**Loan Details:**\n• Limit: Based on business turnover (20–25% of annual sales)\n• Interest Rate: 9% – 16% p.a. (charged only on amount used)\n• Renewal: Annual\n\n**Eligibility:**\n• Business vintage: 2+ years\n• GST-registered business\n• CIBIL: 700+\n\nWhat is your business annual turnover and current bank?\n\n[WHATSAPP_BTN]`;
  }

  if (/insurance|investment|mutual fund|sip|term plan|life insurance|health insurance|wealth/.test(msg)) {
    return `💡 **Insurance & Investment Services**\n\n**Insurance Products:**\n• 🛡️ **Term Life Insurance**: Pure protection at low premiums\n• 🏥 **Health Insurance**: Cashless hospitalization at 10,000+ hospitals\n• 👨‍👩‍👧 **Family Floater**: Cover entire family under one policy\n\n**Investment Products:**\n• 📈 **Mutual Funds**: SIP starting ₹500/month\n• 💰 **Fixed Deposits**: Guaranteed returns\n• 🎯 **ULIP Plans**: Insurance + investment combo\n\n**Tax Benefits**: Up to ₹1.5L under 80C, ₹25K–₹75K under 80D\n\nWhat is your investment goal and monthly surplus?\n\n[WHATSAPP_BTN]`;
  }

  if (/eligib|qualify|cibil|credit score|can i get|am i eligible|will i get|loan approval/.test(msg)) {
    return `✅ **Loan Eligibility — Quick Assessment**\n\n**For Salaried Individuals:**\n• Age: 21–60 years\n• Min Income: ₹15,000/month\n• Employment: 2+ years (1+ year with current employer)\n• CIBIL Score: 700+\n\n**For Self-Employed / Business Owners:**\n• Age: 21–65 years\n• Business Vintage: Min 2–3 years\n• ITR filed for last 2 years\n• CIBIL Score: 700+ (650+ for secured loans)\n\n**CIBIL Score Impact:**\n• 🟢 750+: Best rates & quick approval\n• 🟡 700–749: Good rates, most banks available\n• 🟠 650–699: Higher rates, fewer options\n• 🔴 Below 650: Difficult approval\n\nTo check your specific eligibility, please share:\n1. Employment type\n2. Monthly income\n3. CIBIL score (approximate)\n4. Required loan amount\n\n[WHATSAPP_BTN]`;
  }

  if (/emi|monthly payment|instalment|installment|calculate|repayment|how much pay|how much emi/.test(msg)) {
    return `📊 **EMI Reference Guide**\n\n| Loan Amount | Rate | Tenure | Monthly EMI |\n|-------------|------|--------|-------------|\n| ₹5 Lakh | 12% | 3 yrs | ~₹16,607 |\n| ₹10 Lakh | 12% | 5 yrs | ~₹22,244 |\n| ₹20 Lakh | 10.5% | 5 yrs | ~₹43,041 |\n| ₹50 Lakh | 8.5% | 20 yrs | ~₹43,391 |\n| ₹1 Crore | 9% | 20 yrs | ~₹89,973 |\n| ₹25 Lakh | 15% | 3 yrs | ~₹86,667 |\n\nShare your loan amount, preferred tenure, and loan type for a precise estimate!\n\n[WHATSAPP_BTN]`;
  }

  if (/document|papers|paperwork|required documents|what documents|doc needed|kyc/.test(msg)) {
    return `📋 **Documents Required — Loan Application**\n\n**Common KYC Documents (All Loans):**\n• ✅ Aadhaar Card\n• ✅ PAN Card\n• ✅ Passport-size photographs\n\n**For Salaried Employees:**\n• ✅ Last 3 months salary slips\n• ✅ 6 months bank statement\n• ✅ Form 16 / ITR\n\n**For Self-Employed / Business:**\n• ✅ ITR with computation (2-3 years)\n• ✅ 12 months business bank statement\n• ✅ GST registration & returns\n• ✅ Audited balance sheet & P&L\n\n**For Property-Related Loans:**\n• ✅ Property title deed\n• ✅ Property tax receipts\n• ✅ Valuation report\n\nWhich loan type are you applying for?\n\n[WHATSAPP_BTN]`;
  }

  if (/interest rate|rate of interest|roi|lowest rate|best rate|how much interest/.test(msg)) {
    return `📈 **Interest Rates — Speedy Loan Finance Services**\n\n| Loan Type | Interest Rate (p.a.) |\n|-----------|---------------------|\n| 🏠 Home Loan | 8.40% – 12% |\n| 🎓 Education Loan | 8.5% – 13% |\n| 🏗️ Loan Against Property | 9% – 14% |\n| 💹 Working Capital | 9% – 16% |\n| 💼 Personal Loan | 10.5% – 24% |\n| 🏢 Business Loan | 12% – 26% |\n\n💡 **Higher CIBIL score = Lower rate.** We compare 200+ banks to get you the best!\n\nWhich loan type interests you?\n\n[WHATSAPP_BTN]`;
  }

  if (/contact|call|office|address|visit|location|where|phone|number|email|reach/.test(msg)) {
    return `📞 **Contact Speedy Loan Finance Services**\n\n**📱 Phone**: [73500 05590](tel:+917350005590)\n**📧 Email**: loanspeedy@gmail.com\n**⏰ Hours**: Monday–Saturday, 9:00 AM – 7:00 PM\n\n**📍 Office Address**:\nOffice No. P-227, 2nd Floor\nMayur Trade Center, CTS 4533/4\nNear Chinchwad Railway Station\nChinchwad, Pimpri-Chinchwad\nPune – 411019, Maharashtra\n\n**Services Available:**\n• 🚶 Walk-in consultations (free)\n• 📞 Phone consultation\n• 🏠 Doorstep service (Pune region)\n• 💬 WhatsApp support\n\n[WHATSAPP_BTN]`;
  }

  if (/thank|thanks|thank you|thx|tq|great|helpful|excellent|awesome/.test(msg)) {
    return `😊 You're very welcome! Happy to help.\n\n**Quick Summary of What We Offer:**\n• All types of loans at the best rates\n• 200+ banking partners through Andromeda\n• Free loan consultation & doorstep service\n• Same-day approval in many cases\n\n**Ready to Apply?** Call us at **73500 05590** or connect on WhatsApp below!\n\nIs there anything else I can help you with? 🙏\n\n[WHATSAPP_BTN]`;
  }

  return `💰 **Speedy Loan Finance Services — Your Trusted Loan Partner**\n\nI'm **Redneck Ai**, here to assist with all your financial needs!\n\n**I can help you with:**\n• 💼 Personal Loans (₹50K–₹40L @ 10.5%+)\n• 🏠 Home Loans (up to ₹5 Cr @ 8.4%+)\n• 🏢 Business Loans (₹2L–₹2 Cr)\n• 🎓 Education Loans (up to ₹1.5 Cr)\n• 🏗️ Loan Against Property\n• 🔄 Balance Transfer\n• 💹 Working Capital Loans\n• 📊 EMI Calculator & Eligibility Check\n• 📈 Insurance & Investments\n\n**Quick Contact:**\n📞 73500 05590 | 📧 loanspeedy@gmail.com\n📍 Chinchwad, Pune | ⏰ Mon–Sat, 9AM–7PM\n\nAsk me about any specific loan type!\n\n[WHATSAPP_BTN]`;
}
