"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface UserProfile {
  loanType?: string;
  employmentType?: string;
  businessNature?: string;
  monthlyIncome?: string;
  netProfit?: string;
  monthlyObligations?: string;
  homeLoanProduct?: string;
  propertyType?: string;
  propertyUsage?: string;
  propertyValuation?: string;
  loanAmount?: string;
  cibilScore?: string;
  tenure?: string;
}

type QuestionStep =
  | "language_select"
  | "loan_type"
  | "employment_type"
  | "business_nature"
  | "monthly_income"
  | "net_profit"
  | "monthly_obligations"
  | "home_loan_product"
  | "property_type"
  | "property_usage"
  | "property_valuation"
  | "loan_amount"
  | "cibil_score"
  | "cibil_estimator_prompt"
  | "cibil_estimator_q1"
  | "cibil_estimator_q2"
  | "cibil_estimator_q3"
  | "tenure"
  | "complete"
  | "freetext";

type Language = "English" | "Hindi" | "Marathi";

interface QuestionOption {
  label: string;
  value: string;
  icon: string;
  sub?: string;
}

/* ─────────────────────────────────────────────────────────────
   QUESTIONNAIRE CONFIG
───────────────────────────────────────────────────────────── */
const QUESTIONNAIRE: Record<
  Exclude<QuestionStep, "language_select" | "complete" | "freetext" | "cibil_estimator_prompt" | "cibil_estimator_q1" | "cibil_estimator_q2" | "cibil_estimator_q3">,
  { question: string; options: QuestionOption[] }
> = {
  loan_type: {
    question: "What type of loan are you looking for?",
    options: [
      { icon: "💼", label: "Personal Loan", value: "Personal Loan", sub: "₹50K – ₹40 Lakhs" },
      { icon: "🏢", label: "Business Loan", value: "Business Loan", sub: "₹2L – ₹2 Crore" },
      { icon: "🏠", label: "Home Loan", value: "Home Loan", sub: "Up to ₹5 Crore" },
      { icon: "🏗️", label: "Loan Against Property", value: "Loan Against Property", sub: "Up to 65% property value" },
      { icon: "💹", label: "Working Capital", value: "Working Capital", sub: "CC / OD Facility" },
      { icon: "🛡️", label: "Insurance & Investment", value: "Insurance & Investment", sub: "Term | Health | MF" },
      { icon: "🎓", label: "Education Loan", value: "Education Loan", sub: "₹5L – ₹1.5 Crore" },
      { icon: "🔄", label: "Balance Transfer", value: "Balance Transfer", sub: "Reduce your EMI" },
    ],
  },
  employment_type: {
    question: "What is your employment type?",
    options: [
      { icon: "👔", label: "Salaried", value: "Salaried", sub: "Working professional" },
      { icon: "🧾", label: "Self-Employed", value: "Self-Employed", sub: "Business owner / Freelancer" },
    ],
  },
  business_nature: {
    question: "Nature of Business - business name",
    options: [
      { icon: "🏭", label: "Manufacturing", value: "Manufacturing" },
      { icon: "📦", label: "Trading / Wholesale", value: "Trading / Wholesale" },
      { icon: "🏪", label: "Retail Shop / Store", value: "Retail Shop / Store" },
      { icon: "💻", label: "Services / IT / Consulting", value: "Services / IT / Consulting" },
      { icon: "💼", label: "Professionals (Doc/CA/Eng)", value: "Professionals" },
      { icon: "✏️", label: "Other Business", value: "Other Business" },
    ],
  },
  monthly_income: {
    question: "What is your monthly net salary?",
    options: [], // Rendered dynamically inside QuestionnaireCard
  },
  net_profit: {
    question: "What was your net profit (PAT) in the last financial year?",
    options: [
      { icon: "📉", label: "Net Loss / Break-even", value: "Loss / ₹0" },
      { icon: "💵", label: "Under ₹2 Lakhs", value: "Under ₹2 Lakhs" },
      { icon: "💰", label: "₹2 Lakhs – ₹5 Lakhs", value: "₹2L - ₹5L" },
      { icon: "💎", label: "₹5 Lakhs – ₹15 Lakhs", value: "₹5L - ₹15L" },
      { icon: "👑", label: "Above ₹15 Lakhs", value: "Above ₹15 Lakhs" },
    ],
  },
  monthly_obligations: {
    question: "What are your monthly net obligations (existing EMIs) if any?",
    options: [
      { icon: "🛡️", label: "No current EMIs / ₹0", value: "₹0", sub: "Fully eligible" },
      { icon: "💵", label: "Under ₹10,000 / month", value: "Under ₹10,000" },
      { icon: "💰", label: "₹10,000 – ₹30,000 / month", value: "₹10,000 - ₹30,000" },
      { icon: "💸", label: "₹30,000 – ₹75,000 / month", value: "₹30,000 - ₹75,000" },
      { icon: "⚠️", label: "Above ₹75,000 / month", value: "Above ₹75,000" },
    ],
  },
  home_loan_product: {
    question: "For which product do you want the Home Loan?",
    options: [
      { icon: "🏠", label: "New Home Purchase", value: "New Purchase" },
      { icon: "🏗️", label: "Plot + Construction", value: "Plot Construction" },
      { icon: "🛠️", label: "Home Renovation", value: "Renovation" },
      { icon: "🔄", label: "Balance Transfer + Top-Up", value: "Balance Transfer" },
    ],
  },
  property_type: {
    question: "What is the type of property you are purchasing?",
    options: [
      { icon: "🏢", label: "Builder Purchase", value: "Builder Purchase" },
      { icon: "🔑", label: "Resale Property", value: "Resale Property" },
    ],
  },
  property_usage: {
    question: "What is the type of property?",
    options: [
      { icon: "🏠", label: "Residential Property", value: "Residential property" },
      { icon: "🏭", label: "Industrial Property", value: "Industrial" },
      { icon: "🏢", label: "Commercial Property", value: "Commercial property" },
    ],
  },
  property_valuation: {
    question: "What is the exact property valuation amount?",
    options: [
      { icon: "📌", label: "Under ₹25 Lakhs", value: "Under ₹25 Lakhs" },
      { icon: "📍", label: "₹25 Lakhs – ₹75 Lakhs", value: "₹25L – ₹75L" },
      { icon: "🏢", label: "₹75 Lakhs – ₹2 Crore", value: "₹75L – ₹2 Crore" },
      { icon: "💎", label: "₹2 Crore – ₹5 Crore", value: "₹2Cr – ₹5Cr" },
      { icon: "👑", label: "Above ₹5 Crore", value: "Above ₹5Cr" },
    ],
  },
  loan_amount: {
    question: "What is your required loan amount?",
    options: [
      { icon: "📌", label: "Up to ₹10 Lakhs", value: "Up to ₹10 Lakhs" },
      { icon: "📌", label: "₹10L – ₹50 Lakhs", value: "₹10L – ₹50 Lakhs" },
      { icon: "📍", label: "₹50L – ₹2 Crore", value: "₹50L – ₹2 Crore" },
      { icon: "📍", label: "₹2 Crore – ₹10 Crore", value: "₹2Cr – ₹10Cr" },
      { icon: "🏆", label: "₹10 Crore – ₹100 Crore", value: "₹10Cr – ₹100Cr" },
      { icon: "👑", label: "₹100 Crore & Above", value: "₹100Cr+" },
    ],
  },
  cibil_score: {
    question: "What is your approximate CIBIL / Credit score?",
    options: [
      { icon: "🟢", label: "750 & above", value: "750+" },
      { icon: "🟡", label: "700 – 749", value: "700-749" },
      { icon: "🟠", label: "650 – 699", value: "650-699" },
      { icon: "🔴", label: "Below 650", value: "Below 650" },
      { icon: "❓", label: "Don't know", value: "Unknown" },
    ],
  },
  tenure: {
    question: "What is your preferred loan tenure?",
    options: [
      { icon: "⚡", label: "1 – 2 Years", value: "1-2 Years" },
      { icon: "📅", label: "3 – 5 Years", value: "3-5 Years" },
      { icon: "🗓️", label: "6 – 10 Years", value: "6-10 Years" },
      { icon: "📆", label: "10 – 20 Years", value: "10-20 Years" },
      { icon: "🏠", label: "20 – 30 Years", value: "20-30 Years" },
    ],
  },
};

const STEP_ORDER: Exclude<QuestionStep, "complete" | "freetext" | "cibil_estimator_prompt" | "cibil_estimator_q1" | "cibil_estimator_q2" | "cibil_estimator_q3">[] = [
  "loan_type",
  "employment_type",
  "monthly_income",
  "loan_amount",
  "cibil_score",
  "tenure",
];

/* ─────────────────────────────────────────────────────────────
   SYSTEM PROMPT
───────────────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are "Redneck Ai", the expert AI loan advisor for **Speedy Loan Finance Services** — a premier loan DSA firm based in Pune, Maharashtra, India, founded by Mr. Shashikant Anil Shelke.

## Company Profile
- **Owner:** Shashikant Anil Shelke  
- **Office:** Office No. P-227, 2nd Floor, Mayur Trade Center, Near Chinchwad Railway Station, Chinchwad, Pimpri-Chinchwad, Pune – 411019  
- **Phone:** 73500 05590  
- **Email:** loanspeedy@gmail.com  
- **Hours:** Monday–Saturday, 9:00 AM – 7:00 PM  
- **Andromeda Partner** with 200+ banks and NBFCs  
- **Track Record:** 1.5M+ customers served, ₹75,000+ Cr annual disbursals

## Loan Products
1. **Personal Loan:** ₹50K–₹40L at 10.5%–24% p.a., 12–60 months
2. **Business Loan:** ₹2 Lakhs–₹2 Crore at 12%–26% p.a., 12–48 months
3. **Home Loan:** Up to ₹5 Crore at 8.40%–12% p.a., up to 30 years
4. **Working Capital:** Cash Credit (CC), Overdraft (OD) facilities. Rate: 9%–16% p.a.
5. **Insurance & Investment:** Term life, health, critical illness insurance. Mutual funds, SIP, NPS, bonds.
6. **Loan Against Property:** Up to 65% of property value at 9%–14% p.a., up to 20 years
7. **Education Loan:** Up to ₹1.5 Crore at 8.5%–13% p.a. for India/abroad
8. **Balance Transfer:** Switch high-interest loans to lower rates + top-up option

## Persona Rules
- You are a **RAG-powered senior financial advisor** — authoritative, warm, and deeply knowledgeable.
- When user profile data is provided in the message, acknowledge their specific situation and give eligibility verdict.
- List exact documents needed based on the loan type.
- ALWAYS end with exactly: [WHATSAPP_BTN]
- Only answer finance, loan, and company-related questions.
- Be encouraging and solution-focused.
- Format responses with bullet points, bold headers, and organized sections.`;

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function getActiveSteps(loanType?: string): QuestionStep[] {
  if (loanType === "Personal Loan") {
    return ["loan_type", "employment_type", "monthly_income", "monthly_obligations", "loan_amount"];
  }
  if (loanType === "Business Loan") {
    return ["loan_type", "employment_type", "business_nature", "monthly_income", "net_profit", "monthly_obligations", "loan_amount"];
  }
  if (loanType === "Home Loan") {
    return ["loan_type", "employment_type", "home_loan_product", "monthly_income", "property_type", "monthly_obligations", "loan_amount"];
  }
  if (loanType === "Loan Against Property") {
    return ["loan_type", "employment_type", "monthly_income", "property_usage", "property_valuation", "monthly_obligations", "loan_amount"];
  }
  return STEP_ORDER as QuestionStep[];
}

function getWhatsAppMessageText(userProfile?: UserProfile): string {
  let text = "Hello Speedy Loan Finance Services,\n\nI would like to enquire about a loan.";
  if (userProfile && Object.keys(userProfile).length > 0) {
    text += "\n\n📋 *My Profile Summary:*";
    if (userProfile.loanType) text += `\n• *Loan Type:* ${userProfile.loanType}`;
    if (userProfile.employmentType) text += `\n• *Employment:* ${userProfile.employmentType}`;
    
    if (userProfile.loanType === "Personal Loan") {
      if (userProfile.monthlyIncome) text += `\n• *Monthly Net Salary:* ${userProfile.monthlyIncome}`;
      if (userProfile.monthlyObligations) text += `\n• *Monthly Net Obligations:* ${userProfile.monthlyObligations}`;
      if (userProfile.loanAmount) text += `\n• *Required Loan Amount:* ${userProfile.loanAmount}`;
    } else if (userProfile.loanType === "Business Loan") {
      if (userProfile.businessNature) text += `\n• *Nature of Business / Name:* ${userProfile.businessNature}`;
      if (userProfile.monthlyIncome) text += `\n• *Last Year Turnover:* ${userProfile.monthlyIncome}`;
      if (userProfile.netProfit) text += `\n• *Net Profit:* ${userProfile.netProfit}`;
      if (userProfile.monthlyObligations) text += `\n• *Monthly Net Obligations:* ${userProfile.monthlyObligations}`;
      if (userProfile.loanAmount) text += `\n• *Required Loan Amount:* ${userProfile.loanAmount}`;
    } else if (userProfile.loanType === "Home Loan") {
      if (userProfile.homeLoanProduct) text += `\n• *Home Loan Product:* ${userProfile.homeLoanProduct}`;
      if (userProfile.monthlyIncome) {
        const isSalaried = userProfile.employmentType === "Salaried";
        text += isSalaried
          ? `\n• *Monthly Net Salary:* ${userProfile.monthlyIncome}`
          : `\n• *Last Year Turnover:* ${userProfile.monthlyIncome}`;
      }
      if (userProfile.propertyType) text += `\n• *Property Type:* ${userProfile.propertyType}`;
      if (userProfile.monthlyObligations) text += `\n• *Monthly Net Obligations:* ${userProfile.monthlyObligations}`;
      if (userProfile.loanAmount) text += `\n• *Required Loan Amount:* ${userProfile.loanAmount}`;
    } else if (userProfile.loanType === "Loan Against Property") {
      if (userProfile.monthlyIncome) {
        const isSalaried = userProfile.employmentType === "Salaried";
        text += isSalaried
          ? `\n• *Monthly Net Salary:* ${userProfile.monthlyIncome}`
          : `\n• *Last Year Turnover:* ${userProfile.monthlyIncome}`;
      }
      if (userProfile.propertyUsage) text += `\n• *Property Type:* ${userProfile.propertyUsage}`;
      if (userProfile.propertyValuation) text += `\n• *Exact Property Valuation:* ${userProfile.propertyValuation}`;
      if (userProfile.monthlyObligations) text += `\n• *Monthly Net Obligations:* ${userProfile.monthlyObligations}`;
      if (userProfile.loanAmount) text += `\n• *Required Loan Amount:* ${userProfile.loanAmount}`;
    } else {
      if (userProfile.monthlyIncome) {
        const isSalaried = userProfile.employmentType === "Salaried";
        text += isSalaried
          ? `\n• *Monthly Net Salary:* ${userProfile.monthlyIncome}`
          : `\n• *Last Year Turnover:* ${userProfile.monthlyIncome}`;
      }
      if (userProfile.loanAmount) text += `\n• *Required Loan Amount:* ${userProfile.loanAmount}`;
      if (userProfile.cibilScore) text += `\n• *CIBIL Score:* ${userProfile.cibilScore}`;
      if (userProfile.tenure) text += `\n• *Preferred Tenure:* ${userProfile.tenure}`;
    }
  }
  text += "\n\nPlease assist me with the next steps. Thank you!";
  return text;
}

function buildProfileResponse(profile: UserProfile): string {
  const { loanType, employmentType, monthlyIncome, monthlyObligations, loanAmount, cibilScore, tenure } = profile;

  let summary = `**📋 Your Profile Summary**\n`;
  if (loanType) summary += `• **Loan Type:** ${loanType}\n`;
  if (employmentType) summary += `• **Employment:** ${employmentType}\n`;
  if (profile.businessNature) summary += `• **Business Nature/Name:** ${profile.businessNature}\n`;
  if (monthlyIncome) {
    const isSalaried = employmentType === "Salaried";
    summary += isSalaried
      ? `• **Monthly Net Salary:** ${monthlyIncome}\n`
      : `• **Last Year Turnover:** ${monthlyIncome}\n`;
  }
  if (profile.netProfit) summary += `• **Net Profit (PAT):** ${profile.netProfit}\n`;
  if (profile.homeLoanProduct) summary += `• **Home Loan Product:** ${profile.homeLoanProduct}\n`;
  if (profile.propertyType) summary += `• **Property Type:** ${profile.propertyType}\n`;
  if (profile.propertyUsage) summary += `• **Property Usage:** ${profile.propertyUsage}\n`;
  if (profile.propertyValuation) summary += `• **Property Valuation:** ${profile.propertyValuation}\n`;
  if (monthlyObligations) summary += `• **Monthly Net Obligations:** ${monthlyObligations}\n`;
  if (loanAmount) summary += `• **Amount Required:** ${loanAmount}\n`;
  if (cibilScore && loanType !== "Personal Loan" && loanType !== "Business Loan" && loanType !== "Home Loan" && loanType !== "Loan Against Property") {
    summary += `• **CIBIL Score:** ${cibilScore}\n`;
  }
  if (tenure && loanType !== "Personal Loan" && loanType !== "Business Loan" && loanType !== "Home Loan" && loanType !== "Loan Against Property") {
    summary += `• **Preferred Tenure:** ${tenure}\n`;
  }

  let docsText = "";
  if (loanType === "Home Loan") {
    docsText = `**Home Loan**
- Documents required for residential property purchase or construction.

✅ KYC: Aadhaar, PAN, Passport / Voter ID / Driving License
✅ Address Proof
✅ Income Proof: Salary Slips / ITR
✅ Bank Statement (6–12 months)
✅ Property Documents & Title Papers
✅ Approved Plan & Occupancy Certificate (if applicable)
✅ Passport Size Photographs`;
  } else if (loanType === "Loan Against Property") {
    docsText = `**Loan Against Property (LAP)**
- Secured loan using residential or commercial property as collateral.

✅ KYC Documents
✅ Income Proof & Bank Statements
✅ Property Ownership Documents
✅ Latest Property Tax Receipt
✅ Legal & Valuation Report`;
  } else if (loanType === "Business Loan" || loanType === "MSME Loan" || loanType === "Working Capital" || loanType === "Lease Rental Discounting" || loanType === "Project Funding") {
    docsText = `**Business / MSME Loan**
- Funding solutions for business expansion and working capital needs.

✅ KYC of Proprietor / Partners / Directors
✅ GST, Udyam, Shop Act Registration
✅ ITR (2–3 Years)
✅ Bank Statements (6–12 Months)
✅ Financial Statements
✅ Office Address Proof`;
  } else {
    docsText = `**Personal Loan**
- Unsecured loan for personal, medical, or emergency expenses.

✅ KYC Documents
✅ Salary Slips / ITR
✅ Bank Statement (3–6 months)
✅ Employment / Business Proof
✅ Photographs`;
  }

  return `✅ **Your Personalized Loan Assessment**

${summary}
---

**📄 Documents You'll Need:**

${docsText}

---

**⚡ Next Steps with Speedy Loan:**
1. Share your documents with our expert
2. We compare 200+ banks for the best rate
3. Application submitted within 24 hours
4. Approval in as fast as 72 hours

📞 **73500 05590** | 📍 Chinchwad, Pune

[WHATSAPP_BTN]`;
}

function getFallbackResponse(message: string, profile?: UserProfile): string {
  const msg = message.toLowerCase().trim();
  if (/\b(hi|hello|hey|namaste|namaskar|good morning|good afternoon|good evening|hii)\b/.test(msg)) {
    return `👋 **Welcome to Speedy Loan Finance Services!**

I'm **Redneck Ai**, your personal AI-powered loan advisor. I'll guide you step by step to find the **perfect loan** for your needs.

We partner with **200+ banks & NBFCs** — HDFC, SBI, ICICI, Axis, Bajaj Finance and more — to get you the **best rates with fast approvals.**

Let me start by asking a few quick questions to understand your requirements better. ⬇️

[WHATSAPP_BTN]`;
  }
  if (/personal loan|instant loan|quick loan|salary loan/.test(msg)) {
    return `💼 **Personal Loan — Speedy Loan Finance**\n\n• **Amount:** ₹50,000 – ₹40 Lakhs\n• **Rate:** 10.5% – 24% p.a.\n• **Tenure:** 12 – 60 months\n• **Min CIBIL:** 700+ | Min Income: ₹15,000/month\n\n**Documents:** Aadhaar, PAN, 3mo salary slips, 6mo bank statement, Form 16\n\n📊 **EMI Example:** ₹10L @ 12% for 5 yrs = ~₹22,244/month\n\nWould you like a personalized assessment? Just tell me your monthly income and loan amount!\n\n[WHATSAPP_BTN]`;
  }
  if (/home loan|housing loan|house loan|mortgage/.test(msg)) {
    return `🏠 **Home Loan — Speedy Loan Finance**\n\n• **Amount:** Up to ₹50 Crore\n• **Rate:** 8.40% – 12% p.a.\n• **Tenure:** Up to 30 years\n• **Min CIBIL:** 700+ | Age: 21–65\n\n**Documents:** KYC, income proof, property docs, 12mo bank statement, approved plan\n\n📊 **EMI Example:** ₹50L @ 8.5% for 20 yrs = ~₹43,391/month\n\nWhat property value are you looking at?\n\n[WHATSAPP_BTN]`;
  }
  if (/business loan|expansion/.test(msg)) {
    return `🏢 **Business Loan — Speedy Loan Finance**\n\n• **Amount:** ₹5 Lakhs – ₹50 Crore\n• **Rate:** 12% – 26% p.a.\n• **Tenure:** 12 – 48 months\n• **Business vintage:** Min 2 years | CIBIL: 700+\n\n**Documents:** KYC, GST, ITR (2-3 yrs), 12mo bank statement, audited B/S & P&L\n\nWhat is your business type and required loan amount?\n\n[WHATSAPP_BTN]`;
  }
  if (/working capital|cash credit|overdraft|cc\b|od\b/.test(msg)) {
    return `💹 **Working Capital Loan — Speedy Loan Finance**\n\n• **Facility:** Cash Credit (CC) & Overdraft (OD)\n• **Amount:** Up to ₹100 Crore for corporates\n• **Rate:** 9% – 16% p.a.\n• **Tenure:** Renewable yearly\n• **Security:** Stock, debtors, property pledge\n\n**Documents:** KYC, GST returns (12 months), audited financials, stock statement, 12mo bank statement\n\nWhat is your business turnover and required facility amount?\n\n[WHATSAPP_BTN]`;
  }
  if (/insurance|investment|mutual fund|sip|nps|health insurance|life insurance|term plan/.test(msg)) {
    return `🛡️ **Insurance & Investment — Speedy Loan Finance**\n\n**Insurance Products:**\n• 🛡️ **Term Life Insurance** — Pure protection from ₹25L to ₹10 Crore+\n• 🏥 **Health Insurance** — Individual & family floater plans\n• ⚡ **Critical Illness** — Lump sum on diagnosis\n• 🏢 **Business Insurance** — Fire, liability, keyman insurance\n\nWhat type of insurance or investment are you interested in?\n\n[WHATSAPP_BTN]`;
  }
  if (/lease rental|lrd|rental discounting|rent income|rental income/.test(msg)) {
    return `🏗️ **Lease Rental Discounting (LRD) — Speedy Loan Finance**\n\n• **Amount:** Up to ₹500 Crore\n• **Rate:** 8% – 11% p.a.\n• **Tenure:** Up to 15 years\n• **LTV:** Up to 65-70% of property value\n\nWhat is your monthly rental income and property value?\n\n[WHATSAPP_BTN]`;
  }
  if (/project fund|infrastructure|structured finance|consortium|mega project|large project/.test(msg)) {
    return `📈 **Project Funding — Speedy Loan Finance**\n\n• **Amount:** ₹5 Crore – ₹20,000 Crore\n• **Rate:** 9% – 14% p.a.\n• **Structure:** Consortium banking for mega projects\n\nWhat is your project type and estimated cost?\n\n[WHATSAPP_BTN]`;
  }
  if (/loan against share|share pledge|equity|demat|securities|portfolio/.test(msg)) {
    return `📊 **Loan Against Shares / Securities — Speedy Loan Finance**\n\n• **Amount:** Up to ₹100 Crore (up to 80% of LTV)\n• **Rate:** 8% – 12% p.a.\n• **Tenure:** On demand / 1–3 years renewable\n\nWhat is your approximate portfolio value?\n\n[WHATSAPP_BTN]`;
  }
  if (/msme|mudra|pmegp|cgtmse|udyam/.test(msg)) {
    return `🏭 **MSME Loan — Speedy Loan Finance**\n\n• **Amount:** ₹10 Lakhs – ₹10 Crore\n• **Rate:** 9% – 18% p.a.\n• **Schemes:** MUDRA, CGTMSE, PMEGP\n\nWe specialize in getting MSME loans sanctioned quickly with government scheme benefits!\n\n[WHATSAPP_BTN]`;
  }
  if (/loan against property|lap\b|property loan/.test(msg)) {
    return `🏗️ **Loan Against Property**\n\n• **Amount:** Up to 65% of property value\n• **Rate:** 9% – 14% p.a.\n• **Tenure:** Up to 20 years\n\nDo you own residential or commercial property?\n\n[WHATSAPP_BTN]`;
  }
  if (/balance transfer|refinance|lower rate|reduce emi/.test(msg)) {
    return `🔄 **Balance Transfer**\n\n• Transfer existing loans to lower interest rates\n• **Top-up option** available\n• Works for Home, Personal & Business Loans\n\nWhich bank is your current loan with, and what is the outstanding amount?\n\n[WHATSAPP_BTN]`;
  }
  if (/education loan|study loan|student loan|abroad/.test(msg)) {
    return `🎓 **Education Loan**\n\n• **India:** Up to ₹50 Lakhs\n• **Abroad:** Up to ₹1.5 Crore\n• **Rate:** 8.5% – 13% p.a.\n\n[WHATSAPP_BTN]`;
  }
  if (/eligib|qualify|cibil|credit score|can i get|am i eligible/.test(msg)) {
    return `✅ **Loan Eligibility Guide**\n\n**Salaried:** Min ₹15,000/month, 2+ yrs, CIBIL 700+, age 21–60\n**Self-Employed:** 2-3 yrs business, ITR filed, CIBIL 700+, age 21–65\n\nShare your employment type, income & CIBIL for a **precise eligibility check!**\n\n[WHATSAPP_BTN]`;
  }
  if (/emi|monthly payment|instalment|calculate/.test(msg)) {
    return `📊 **EMI Reference Table**\n\n| Loan | Rate | Tenure | EMI |\n|------|------|--------|-----|\n| ₹5L | 12% | 3 yrs | ~₹16,607 |\n| ₹10L | 12% | 5 yrs | ~₹22,244 |\n| ₹50L | 8.5% | 20 yrs | ~₹43,391 |\n| ₹1Cr | 9% | 20 yrs | ~₹89,973 |\n\nShare your loan amount, tenure & type for a **precise EMI calculation!**\n\n[WHATSAPP_BTN]`;
  }
  if (/document|papers|required documents|kyc/.test(msg)) {
    return `📋 **Documents Required**\n\n**KYC (All Loans):**\n✅ Aadhaar + PAN Card\n✅ Passport-size photos\n\n**Salaried:**\n✅ Last 3 months salary slips\n✅ 6 months bank statement\n✅ Form 16 / ITR\n\n**Self-Employed / Business:**\n✅ ITR with computation (2-3 years)\n✅ 12 months bank statement\n✅ GST registration & returns\n✅ Audited balance sheet & P&L\n\nWhich loan are you applying for?\n\n[WHATSAPP_BTN]`;
  }
  if (/interest rate|rate of interest|roi|lowest rate/.test(msg)) {
    return `📈 **Current Interest Rates**\n\n| Loan Type | Rate (p.a.) |\n|-----------|-------------|\n| 🏠 Home Loan | 8.40% – 12% |\n| 🏗️ LAP | 9% – 14% |\n| 🏭 MSME | 9% – 18% |\n| 💼 Personal | 10.5% – 24% |\n| 🏢 Business | 12% – 26% |\n\n💡 Higher CIBIL score = Lower interest rate. We compare 200+ lenders for you!\n\n[WHATSAPP_BTN]`;
  }
  if (/contact|call|office|address|visit|location|phone|email|reach/.test(msg)) {
    return `📞 **Contact Speedy Loan Finance Services**\n\n**📱 Phone:** 73500 05590\n**📧 Email:** loanspeedy@gmail.com\n**⏰ Hours:** Mon–Sat, 9:00 AM – 7:00 PM\n\n**📍 Office:**\nOffice No. P-227, 2nd Floor\nMayur Trade Center, Near Chinchwad Railway Station\nChinchwad, Pimpri-Chinchwad, Pune – 411019\n\n[WHATSAPP_BTN]`;
  }
  if (profile && Object.keys(profile).length >= 3) {
    return buildProfileResponse(profile);
  }
  return `💰 **Speedy Loan Finance Services**\n\nI can help you with:\n• 💼 Personal | 🏢 Business | 🏠 Home Loans\n• 🏗️ Loan Against Property | 🏭 MSME Loans\n• 🔄 Balance Transfer\n\n📞 **73500 05590** | 📧 loanspeedy@gmail.com\n📍 Chinchwad, Pune | ⏰ Mon–Sat, 9AM–7PM\n\nAsk me about any specific loan type!\n\n[WHATSAPP_BTN]`;
}

/* ─────────────────────────────────────────────────────────────
   MARKDOWN FORMATTER
───────────────────────────────────────────────────────────── */
function formatText(text: string, isUser: boolean, userProfile?: UserProfile) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let inTable = false;

  const flushTable = (key: string) => {
    if (tableBuffer.length < 2) {
      tableBuffer.forEach((l, i) => elements.push(<div key={`tr-${key}-${i}`}>{l}</div>));
      tableBuffer = [];
      inTable = false;
      return;
    }
    const [header, , ...rows] = tableBuffer;
    const headers = header.split("|").map(h => h.trim()).filter(Boolean);
    const dataRows = rows.map(r => r.split("|").map(c => c.trim()).filter(Boolean));
    elements.push(
      <div key={`table-${key}`} className="overflow-x-auto my-2 rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="text-xs w-full">
          <thead>
            <tr className={isUser ? "bg-white/10" : "bg-slate-100 dark:bg-slate-800"}>
              {headers.map((h, i) => <th key={i} className="px-3 py-2 font-semibold text-left">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/50"}>
                {row.map((cell, ci) => <td key={ci} className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-700">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
    inTable = false;
  };

  lines.forEach((line, idx) => {
    if (line.trim().startsWith("|")) {
      if (!inTable) inTable = true;
      tableBuffer.push(line.trim());
    } else {
      if (inTable) flushTable(`${idx}`);
      if (line === "---" || line === "---") {
        elements.push(<hr key={idx} className={`my-2 border-0 border-t ${isUser ? "border-white/20" : "border-slate-200 dark:border-slate-700"}`} />);
        return;
      }
      if (line === "[WHATSAPP_BTN]") {
        const waText = getWhatsAppMessageText(userProfile);
        const encodedText = encodeURIComponent(waText);
        const waUrl = `https://wa.me/917350005590?text=${encodedText}`;

        elements.push(
          <div key={idx} className="mt-3">
            <p className="text-[11px] font-semibold mb-2 opacity-80">Connect with our expert advisor:</p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.004-6.637 5.4-12.012 12.011-12.012 3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.546 1.875 14.07.843 11.435.841 5.996.841 1.572 5.261 1.568 10.7c-.001 1.708.452 3.376 1.312 4.86l-.995 3.633 3.762-.986zM17.487 14.39c-.3-.15-1.774-.875-2.046-.975-.273-.1-.472-.15-.672.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.205-1.075-1.73-2.146-1.92-2.436-.19-.3-.02-.45.13-.6.13-.13.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.672-1.62-1.046-2.52-.363-.878-.73-.76-.975-.76-.2-.01-.43-.01-.67-.01-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3 .01 1.77 1.28 3.48 1.46 3.71.18.23 2.52 3.85 6.1 5.39.85.37 1.52.59 2.03.76.86.27 1.64.23 2.26.14.69-.1 2.04-.83 2.33-1.63.29-.8.29-1.49.2-1.63-.09-.13-.29-.21-.59-.36z" />
              </svg>
              WhatsApp with Advisor
            </a>
          </div>
        );
        return;
      }
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const formatted = parts.map((p, pi) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={pi} className={isUser ? "text-white font-bold" : "font-bold text-slate-900 dark:text-white"}>{p.slice(2, -2)}</strong>
          : <span key={pi}>{p}</span>
      );
      elements.push(<div key={idx} className={`${line === "" ? "h-1.5" : ""} leading-relaxed`}>{formatted}</div>);
    }
  });
  if (inTable) flushTable("end");
  return elements;
}

/* ─────────────────────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 mb-3">
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-md ring-2 ring-blue-500/20 bg-white flex items-center justify-center p-0.5">
        <img src="/images/redneck-avatar.png" alt="Redneck Ai" className="w-full h-full object-contain" />
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 150, 300].map(d => (
            <span key={d} className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-bounce" style={{ animationDelay: `${d}ms`, animationDuration: "1s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LANGUAGE SELECT CARD
───────────────────────────────────────────────────────────── */
function LanguageSelectCard({ onSelect }: { onSelect: (lang: Language) => void }) {
  const langs: { code: Language; name: string; native: string; desc: string; emoji: string; bg: string; shadow: string }[] = [
    {
      code: "English",
      name: "English",
      native: "English",
      desc: "Communicate in English",
      emoji: "🇬🇧",
      bg: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
      shadow: "rgba(37,99,235,0.35)",
    },
    {
      code: "Hindi",
      name: "हिंदी",
      native: "Hindi",
      desc: "हिंदी में बात करें",
      emoji: "🇮🇳",
      bg: "linear-gradient(135deg, #92400e 0%, #d97706 100%)",
      shadow: "rgba(217,119,6,0.35)",
    },
    {
      code: "Marathi",
      name: "मराठी",
      native: "Marathi",
      desc: "मराठीत संवाद साधा",
      emoji: "🏵️",
      bg: "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
      shadow: "rgba(5,150,105,0.35)",
    },
  ];

  return (
    <div
      className="rounded-2xl rounded-bl-sm overflow-hidden max-w-[92%] w-full"
      style={{
        background: "rgba(255,255,255,0.95)",
        border: "1px solid rgba(203,213,225,0.7)",
        boxShadow: "0 4px 20px rgba(15,30,70,0.1)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="px-4 pt-4 pb-3">
        <p className="text-sm font-bold text-slate-800 leading-snug">🌐 Choose your preferred language</p>
        <p className="text-[11px] text-slate-400 mt-1 font-medium tracking-wide">
          भाषा चुनें &nbsp;·&nbsp; भाषा निवडा
        </p>
      </div>
      <div className="px-3 pb-4 flex flex-col gap-2.5">
        {langs.map((lang, i) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className="group w-full text-left px-4 py-3 rounded-xl text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: lang.bg,
              boxShadow: `0 4px 14px ${lang.shadow}`,
              animationDelay: `${i * 80}ms`,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.emoji}</span>
              <div className="flex-1">
                <p className="font-extrabold text-base leading-tight">{lang.name}</p>
                <p className="text-[11px] text-white/70 leading-tight mt-0.5">{lang.desc}</p>
              </div>
              <span className="text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all text-lg">›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuestionnaireCard({
  step,
  employmentType,
  onSelect,
}: {
  step: Exclude<
    QuestionStep,
    "language_select" | "complete" | "freetext" | "cibil_estimator_prompt" | "cibil_estimator_q1" | "cibil_estimator_q2" | "cibil_estimator_q3"
  >;
  employmentType?: string;
  onSelect: (value: string, label: string) => void;
}) {
  const q = { ...QUESTIONNAIRE[step] };
  
  if (step === "monthly_income") {
    if (employmentType === "Salaried") {
      q.question = "What is your monthly net salary?";
      q.options = [
        { icon: "💵", label: "Below ₹25,000", value: "Below ₹25,000" },
        { icon: "💵", label: "₹25,000 – ₹50,000", value: "₹25,000 – ₹50,000" },
        { icon: "💵", label: "₹50,000 – ₹1 Lakh", value: "₹50,000 – ₹1 Lakh" },
        { icon: "💰", label: "₹1L – ₹2 Lakhs", value: "₹1L – ₹2 Lakhs" },
        { icon: "👑", label: "Above ₹2 Lakhs", value: "Above ₹2 Lakhs" },
      ];
    } else {
      q.question = "What was your last year financial turnover?";
      q.options = [
        { icon: "📊", label: "Below ₹12 Lakhs", value: "Below ₹12 Lakhs" },
        { icon: "📊", label: "₹12 Lakhs – ₹40 Lakhs", value: "₹12 Lakhs – ₹40 Lakhs" },
        { icon: "💰", label: "₹40 Lakhs – ₹1 Crore", value: "₹40 Lakhs – ₹1 Crore" },
        { icon: "💎", label: "₹1Cr – ₹5 Crore", value: "₹1Cr – ₹5 Crore" },
        { icon: "👑", label: "Above ₹5 Crore", value: "Above ₹5 Crore" },
      ];
    }
  }

  const showTypePrompt = step === "property_valuation" || step === "business_nature";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden max-w-[92%] w-full">
      <div className="px-4 pt-4 pb-3">
        <p className="text-sm font-semibold text-slate-800 dark:text-white leading-snug">{q.question}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          {showTypePrompt ? "Select an option below or type it in the message box" : "Select one option below"}
        </p>
      </div>
      <div className="px-3 pb-3 grid grid-cols-2 gap-2">
        {q.options.map((opt: QuestionOption) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value, opt.label)}
            className="group text-left px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-650 bg-slate-50 dark:bg-slate-700/50 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:border-blue-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-base">{opt.icon}</span>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 mt-1 leading-tight">{opt.label}</p>
            {opt.sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">{opt.sub}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}

function EstimatorQuestionCard({
  question,
  options,
  onSelect,
}: {
  question: string;
  options: { label: string; points: number }[];
  onSelect: (points: number, label: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden max-w-[92%] w-full">
      <div className="px-4 pt-4 pb-3">
        <p className="text-sm font-semibold text-slate-800 dark:text-white leading-snug">{question}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Choose the option that fits best</p>
      </div>
      <div className="px-3 pb-3 flex flex-col gap-2">
        {options.map(opt => (
          <button
            key={opt.label}
            onClick={() => onSelect(opt.points, opt.label)}
            className="group text-left px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-605 bg-slate-50 dark:bg-slate-700/50 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:border-blue-500 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 leading-tight">{opt.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ step, loanType }: { step: QuestionStep; loanType?: string }) {
  if (step === "language_select") return null;

  let mappedStep = step;
  if (
    step === "cibil_estimator_prompt" ||
    step === "cibil_estimator_q1" ||
    step === "cibil_estimator_q2" ||
    step === "cibil_estimator_q3"
  ) {
    mappedStep = "cibil_score";
  }
  
  const steps = getActiveSteps(loanType);
  const stepIndex = steps.indexOf(mappedStep as any);
  const progress = step === "complete" || step === "freetext" ? 100 : Math.round(((stepIndex) / steps.length) * 100);
  const isDone = step === "complete" || step === "freetext" || stepIndex === steps.length;

  if (step === "freetext" && stepIndex === -1) return null;

  return (
    <div className="px-4 py-2 flex-shrink-0 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {isDone ? "✅ Profile Complete" : `Step ${stepIndex + 1} of ${steps.length}`}
        </span>
        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
      </div>
      <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: isDone ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #3b82f6, #6366f1)",
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function LoanChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<QuestionStep>("language_select");
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [estimatorAnswers, setEstimatorAnswers] = useState<Record<string, number>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("English");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: `🙏 **Welcome · स्वागत · स्वागत आहे!**

I'm **Redneck Ai** — your AI-powered loan advisor for **Speedy Loan Finance Services**, Pune.

To serve you better, please select your **preferred language** below. 👇`,
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<ReturnType<ReturnType<GoogleGenerativeAI["getGenerativeModel"]>["startChat"]> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setUnreadCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!hasOpened) {
      const t1 = setTimeout(() => setUnreadCount(1), 6000);
      return () => { clearTimeout(t1); };
    }
  }, [hasOpened]);

  /* ── Language-aware questionnaire confirmation messages ─── */
  const getConfirmText = useCallback((nextStep: string, lang: Language, profile: UserProfile): string => {
    const isSalaried = profile.employmentType === "Salaried";
    const map: Record<Language, Record<string, string>> = {
      English: {
        employment_type: "What is your employment type?",
        business_nature: "Nature of Business / Business name?",
        monthly_income_salaried: "What is your monthly net salary?",
        monthly_income_self: "What was your last year financial turnover?",
        net_profit: "What was your net profit (PAT) in the last financial year?",
        monthly_obligations: "What are your monthly net obligations (existing EMIs) if any?",
        home_loan_product: "For which product do you want the Home Loan?",
        property_type: "What is the type of property you are purchasing?",
        property_usage: "What is the type of property?",
        property_valuation: "What is the exact property valuation amount?",
        loan_amount: "What is your required loan amount?",
        cibil_score: "What is your approximate CIBIL / Credit score?",
        tenure: "What is your preferred loan tenure?",
      },
      Hindi: {
        employment_type: "आपका रोजगार का प्रकार क्या है?",
        business_nature: "आपके व्यवसाय की प्रकृति / नाम?",
        monthly_income_salaried: "आपकी मासिक नेट सैलरी क्या है?",
        monthly_income_self: "आपका पिछले साल का वित्तीय टर्नओवर क्या था?",
        net_profit: "पिछले वित्त वर्ष में शुद्ध लाभ (PAT) कितना था?",
        monthly_obligations: "आपकी मौजूदा मासिक EMI कितनी है?",
        home_loan_product: "आप किस उद्देश्य के लिए होम लोन चाहते हैं?",
        property_type: "आप कौनसी संपत्ति खरीद रहे हैं?",
        property_usage: "संपत्ति का उपयोग क्या है?",
        property_valuation: "संपत्ति का सटीक मूल्यांकन क्या है?",
        loan_amount: "आपको कितने लोन की जरूरत है?",
        cibil_score: "आपका CIBIL / क्रेडिट स्कोर लगभग क्या है?",
        tenure: "आपकी पसंदीदा लोन अवधि क्या है?",
      },
      Marathi: {
        employment_type: "तुमचा रोजगाराचा प्रकार काय आहे?",
        business_nature: "तुमच्या व्यवसायाचे स्वरूप / नाव?",
        monthly_income_salaried: "तुमचा मासिक नेट पगार किती आहे?",
        monthly_income_self: "मागील वर्षाचा आर्थिक उलाढाल किती होता?",
        net_profit: "मागील आर्थिक वर्षात निव्वळ नफा (PAT) किती होता?",
        monthly_obligations: "तुमचे विद्यमान मासिक EMI किती आहे?",
        home_loan_product: "होम लोन कोणत्या उद्देशासाठी हवे आहे?",
        property_type: "तुम्ही कोणती मालमत्ता खरेदी करत आहात?",
        property_usage: "मालमत्तेचा वापर कोणता आहे?",
        property_valuation: "मालमत्तेचे नक्की मूल्यांकन किती आहे?",
        loan_amount: "तुम्हाला किती कर्ज हवे आहे?",
        cibil_score: "तुमचा अंदाजे CIBIL / क्रेडिट स्कोर काय आहे?",
        tenure: "तुम्हाला पसंतीचा कर्जाचा कालावधी किती आहे?",
      },
    };
    const t = map[lang];
    if (nextStep === "monthly_income") return isSalaried ? t.monthly_income_salaried : t.monthly_income_self;
    return t[nextStep] || "";
  }, []);

  /* ── Questionnaire selection handler ─────────────────────── */
  const handleQuestionnaireSelect = useCallback(async (value: string, label: string) => {
    // ── Language selection (first step) ──────────────────────
    if (currentStep === "language_select") {
      const lang = value as Language;
      setSelectedLanguage(lang);

      const userMsg: Message = { id: Date.now().toString(), role: "user", text: label, timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);

      const greetings: Record<Language, string> = {
        English: `👋 **Welcome to Speedy Loan Finance Services!**

I'm **Redneck Ai**, your personal AI-powered loan advisor. I'll guide you step by step to find the **perfect loan** for your needs.

We partner with **200+ banks & NBFCs** — HDFC, SBI, ICICI, Bajaj Finance and more — to get you the **best rates with approvals in 72 hours.**

Let me start with a few quick questions. ⬇️`,
        Hindi: `👋 **स्पीडी लोन फाइनेंस सर्विसेज में आपका स्वागत है!**

मैं **Redneck Ai** हूं, आपका व्यक्तिगत AI लोन सलाहकार। मैं आपको सही लोन खोजने में हर कदम पर मार्गदर्शन करूंगा।

हम **200+ बैंकों और NBFCs** के साथ काम करते हैं — HDFC, SBI, ICICI, बजाज फाइनेंस और अन्य — सर्वोत्तम दरों पर 72 घंटों में अनुमोदन दिलाने के लिए।

कुछ त्वरित प्रश्नों से शुरू करते हैं। ⬇️`,
        Marathi: `👋 **स्पीडी लोन फायनान्स सर्व्हिसेसमध्ये आपले स्वागत आहे!**

मी **Redneck Ai** आहे, तुमचा वैयक्तिक AI कर्ज सल्लागार. मी तुम्हाला योग्य कर्ज शोधण्यासाठी प्रत्येक पावलावर मार्गदर्शन करेन.

आम्ही **200+ बँका आणि NBFCs** सोबत काम करतो — HDFC, SBI, ICICI, बजाज फायनान्स आणि इतर — सर्वोत्तम दरात 72 तासांत मंजुरी मिळवण्यासाठी.

चला काही प्रश्नांनी सुरुवात करूया. ⬇️`,
      };

      setIsLoading(true);
      await new Promise(r => setTimeout(r, 500));
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: greetings[lang],
        timestamp: new Date(),
      }]);
      setIsLoading(false);
      setCurrentStep("loan_type");
      return;
    }

    const activeSteps = getActiveSteps(userProfile.loanType || (currentStep === "loan_type" ? value : undefined));
    const stepIndex = activeSteps.indexOf(currentStep as any);
    
    const keyMapping: Record<string, keyof UserProfile> = {
      loan_type: "loanType",
      employment_type: "employmentType",
      business_nature: "businessNature",
      monthly_income: "monthlyIncome",
      net_profit: "netProfit",
      monthly_obligations: "monthlyObligations",
      home_loan_product: "homeLoanProduct",
      property_type: "propertyType",
      property_usage: "propertyUsage",
      property_valuation: "propertyValuation",
      loan_amount: "loanAmount",
      cibil_score: "cibilScore",
      tenure: "tenure",
    };
    const profileKey = keyMapping[currentStep];

    // Add user selection as message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: label,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    if (currentStep === "cibil_score" && value === "Unknown") {
      setCurrentStep("cibil_estimator_prompt");
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 600));
      const noScoreMsg: Record<Language, string> = {
        English: `No problem! I can help you estimate your CIBIL score using a quick 3-question analyzer.\n\nClick the **Check Credit Score** button below to start.`,
        Hindi: `कोई बात नहीं! मैं 3 सवालों के जरिए आपका CIBIL स्कोर का अनुमान लगा सकता हूं।\n\nनीचे **Check Credit Score** बटन दबाएं।`,
        Marathi: `काळजी नको! 3 प्रश्नांद्वारे मी तुमचा CIBIL स्कोर अंदाज करू शकतो.\n\nखाली **Check Credit Score** बटण दाबा.`,
      };
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "bot", text: noScoreMsg[selectedLanguage], timestamp: new Date() }]);
      setIsLoading(false);
      return;
    }

    // Update profile
    const newProfile = { ...userProfile, [profileKey]: value };
    if (currentStep === "loan_type") newProfile.loanType = value;
    setUserProfile(newProfile);

    const nextStepIndex = stepIndex + 1;

    if (nextStepIndex >= activeSteps.length) {
      // Questionnaire complete — generate RAG-powered recommendation
      setCurrentStep("complete");
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 800));

      let reply = "";
      try {
        const profileSummary = `User Profile:
- Loan Type: ${newProfile.loanType}
- Employment: ${newProfile.employmentType}
${newProfile.businessNature ? `- Business Nature/Name: ${newProfile.businessNature}\n` : ""}${newProfile.monthlyIncome ? `- Monthly Income/Turnover: ${newProfile.monthlyIncome}\n` : ""}${newProfile.netProfit ? `- Net Profit: ${newProfile.netProfit}\n` : ""}${newProfile.homeLoanProduct ? `- Home Loan Product: ${newProfile.homeLoanProduct}\n` : ""}${newProfile.propertyType ? `- Property Purchase Type: ${newProfile.propertyType}\n` : ""}${newProfile.propertyUsage ? `- Mortgaged Property Usage: ${newProfile.propertyUsage}\n` : ""}${newProfile.propertyValuation ? `- Exact Property Valuation: ${newProfile.propertyValuation}\n` : ""}${newProfile.monthlyObligations ? `- Monthly Obligations: ${newProfile.monthlyObligations}\n` : ""}- Required Loan Amount: ${newProfile.loanAmount}
${newProfile.cibilScore ? `- CIBIL Score: ${newProfile.cibilScore}\n` : ""}${newProfile.tenure ? `- Preferred Tenure: ${newProfile.tenure}\n` : ""}

Provide a detailed, personalized loan recommendation. Include eligibility verdict, required documents, and next steps.`;

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: profileSummary, history: [], language: selectedLanguage }),
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.reply || buildProfileResponse(newProfile);
        } else {
          reply = buildProfileResponse(newProfile);
        }
      } catch {
        reply = buildProfileResponse(newProfile);
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "bot", text: reply, timestamp: new Date() }]);

      const followUpMsg: Record<Language, string> = {
        English: "💬 You can now ask me **any follow-up questions** about your loan, documents, process, or anything else. I'm here to help!\n\n[WHATSAPP_BTN]",
        Hindi: "💬 अब आप मुझसे अपने लोन, दस्तावेज़, प्रक्रिया या किसी भी चीज़ के बारे में **कोई भी सवाल पूछ सकते हैं।** मैं यहाँ हूं!\n\n[WHATSAPP_BTN]",
        Marathi: "💬 आता तुम्ही तुमच्या कर्ज, कागदपत्रे, प्रक्रिया किंवा इतर कोणत्याही गोष्टींबद्दल **कोणतेही प्रश्न विचारू शकता.** मी इथे आहे!\n\n[WHATSAPP_BTN]",
      };
      setTimeout(() => {
        setMessages(prev => [...prev, { id: (Date.now() + 2).toString(), role: "bot", text: followUpMsg[selectedLanguage], timestamp: new Date() }]);
      }, 1200);

      setIsLoading(false);
    } else {
      // Move to next question
      const nextStep = activeSteps[nextStepIndex];
      setCurrentStep(nextStep);

      const confirm = getConfirmText(nextStep, selectedLanguage, newProfile);
      if (confirm) {
        await new Promise(r => setTimeout(r, 400));
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "bot", text: confirm, timestamp: new Date() }]);
      }
    }
  }, [currentStep, userProfile, selectedLanguage, getConfirmText]);

  /* ── Credit Score Estimator handlers ────────────────────── */
  const handleStartEstimator = useCallback(async () => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: "Check Credit Score",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    
    setEstimatorAnswers({});
    setCurrentStep("cibil_estimator_q1");
  }, []);

  const handleEstimatorSelect = useCallback(async (points: number, label: string, nextStep: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: label,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    if (nextStep === "cibil_estimator_q2") {
      setEstimatorAnswers({ q1: points });
      setCurrentStep("cibil_estimator_q2");
    } else if (nextStep === "cibil_estimator_q3") {
      setEstimatorAnswers(prev => ({ ...prev, q2: points }));
      setCurrentStep("cibil_estimator_q3");
    } else {
      const q1Pts = estimatorAnswers.q1 ?? 280;
      const q2Pts = estimatorAnswers.q2 ?? 120;
      const q3Pts = points;
      const finalScore = 300 + q1Pts + q2Pts + q3Pts;

      let mappedRange = "750+";
      if (finalScore >= 720) {
        mappedRange = "750+";
      } else if (finalScore >= 670) {
        mappedRange = "700-749";
      } else if (finalScore >= 620) {
        mappedRange = "650-699";
      } else {
        mappedRange = "Below 650";
      }

      setIsLoading(true);
      await new Promise(r => setTimeout(r, 600));

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "bot",
          text: `🎉 **Credit Score Analysis Complete!**\n\nEstimated Score: **~${finalScore}** (${mappedRange} range)\n\nWe have fetched this score and updated your profile accordingly!`,
          timestamp: new Date(),
        },
      ]);

      setUserProfile(prev => ({ ...prev, cibilScore: mappedRange }));
      setCurrentStep("tenure");

      await new Promise(r => setTimeout(r, 1000));
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: `What is your preferred loan tenure?`,
          timestamp: new Date(),
        },
      ]);
      
      setIsLoading(false);
    }
  }, [estimatorAnswers]);

  /* ── Free-text message handler (RAG-powered) ────────────── */
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let reply = "";
    try {
      // Build conversation history for RAG API (last 10 messages)
      const recentMessages = messages.slice(-10);
      const history = recentMessages.map(m => ({
        role: m.role === "user" ? "user" : "model" as const,
        parts: [{ text: m.text }],
      }));

      // Add user profile context to the message
      const contextPrefix = Object.keys(userProfile).length > 0
        ? `[User profile: Loan=${userProfile.loanType}, Employment=${userProfile.employmentType}, Income=${userProfile.monthlyIncome}, Amount=${userProfile.loanAmount}, CIBIL=${userProfile.cibilScore}, Tenure=${userProfile.tenure}] `
        : "";

      // Call our RAG-enhanced server API with language context
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: contextPrefix + text.trim(),
          history,
          language: selectedLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        reply = data.reply || getFallbackResponse(text, userProfile);
      } else {
        reply = getFallbackResponse(text, userProfile);
      }
    } catch {
      chatRef.current = null;
      reply = getFallbackResponse(text, userProfile);
    }

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: "bot",
      text: reply,
      timestamp: new Date(),
    }]);
    if (!isOpen) setUnreadCount(n => n + 1);
    setIsLoading(false);
  }, [isLoading, isOpen, userProfile, messages, selectedLanguage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isQuestionnaireActive) {
      if (input.trim()) {
        handleQuestionnaireSelect(input.trim(), input.trim());
        setInput("");
      }
    } else {
      sendMessage(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isQuestionnaireActive) {
        if (input.trim()) {
          handleQuestionnaireSelect(input.trim(), input.trim());
          setInput("");
        }
      } else {
        sendMessage(input);
      }
    }
  };

  const handleOpen = () => { setIsOpen(true); setHasOpened(true); setUnreadCount(0); };

  const clearChat = () => {
    chatRef.current = null;
    setUserProfile({});
    setCurrentStep("language_select");
    setSelectedLanguage("English");
    setEstimatorAnswers({});
    setMessages([{
      id: "welcome",
      role: "bot",
      text: `🙏 **Welcome · स्वागत · स्वागत आहे!**

I'm **Redneck Ai** — your AI-powered loan advisor for **Speedy Loan Finance Services**, Pune.

To serve you better, please select your **preferred language** below. 👇`,
      timestamp: new Date(),
    }]);
  };

  const isQuestionnaireActive = currentStep !== "complete" && currentStep !== "freetext";
  const activeStepsForRender = getActiveSteps(userProfile.loanType);
  const currentStepIndex = activeStepsForRender.indexOf(currentStep as any);

  const waText = getWhatsAppMessageText(userProfile);
  const dynamicWaUrl = `https://wa.me/917350005590?text=${encodeURIComponent(waText)}`;

  return (
    <>
      {/* ── Floating Button Stack ────────────────────────────── */}
      <div
        className="fixed right-6 z-[9999] flex flex-col items-end -translate-y-1/2"
        style={{ top: "75%", gap: "40px" }}
      >
        {/* Tooltip bubble */}
        {!isOpen && !hasOpened && (
          <div className="text-sm px-4 py-2 rounded-2xl shadow-xl max-w-[200px] text-center relative bg-slate-900 text-white border border-slate-700/50">
            💬 Ask about loans!
          </div>
        )}

        {/* Main AI FAB */}
        <button
          onClick={isOpen ? () => setIsOpen(false) : handleOpen}
          aria-label="Open loan chat assistant"
          className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: isOpen
              ? "#374151"
              : "linear-gradient(135deg, #0B1D3E 0%, #1a3a6e 100%)",
            boxShadow: isOpen ? "" : "0 8px 32px rgba(11,29,62,0.4), 0 0 0 3px rgba(245,166,35,0.15)",
            transform: isOpen ? "scale(0.9)" : undefined,
          }}
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#ffffff">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8 drop-shadow-xl" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2V6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="2" r="1.5" fill="#F5A623" />
              <path d="M2 11H4V15H2V11Z" fill="#F5A623" />
              <path d="M20 11H22V15H20V11Z" fill="#F5A623" />
              <rect x="4" y="6" width="16" height="13" rx="4" fill="url(#robotGlass)" stroke="white" strokeWidth="1.5" />
              <circle cx="9" cy="11" r="2" fill="#cccccc" className="animate-pulse" style={{ animationDuration: "2s" }} />
              <circle cx="15" cy="11" r="2" fill="#cccccc" className="animate-pulse" style={{ animationDuration: "2s" }} />
              <path d="M9 15.5C9 15.5 10.5 17 12 17C13.5 17 15 15.5 15 15.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="robotGlass" x1="4" y1="6" x2="20" y2="19" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          )}

          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full opacity-30 animate-ping bg-orange-700" />
          )}
        </button>

        {/* WhatsApp FAB */}
        <a
          href={dynamicWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          title="WhatsApp Us"
          className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 bg-gradient-to-br from-[#25D366] to-[#128C7E]"
          style={{ boxShadow: "0 8px 32px rgba(37,211,102,0.3), 0 0 0 3px rgba(37,211,102,0.1)" }}
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.546 1.875 14.07 .843 11.435.841 5.996.841 1.572 5.261 1.568 10.7c-.001 1.708.452 3.376 1.312 4.86l-.995 3.633 3.762-.986zM17.487 14.39c-.3-.15-1.774-.875-2.046-.975-.273-.1-.472-.15-.672.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.205-1.075-1.73-2.146-1.92-2.436-.19-.3-.02-.45.13-.6.13-.13.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.672-1.62-1.046-2.52-.363-.878-.73-.76-.975-.76-.2-.01-.43-.01-.67-.01-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3 .01 1.77 1.28 3.48 1.46 3.71.18.23 2.52 3.85 6.1 5.39.85.37 1.52.59 2.03.76.86.27 1.64.23 2.26.14.69-.1 2.04-.83 2.33-1.63.29-.8.29-1.49.2-1.63-.09-.13-.29-.21-.59-.36z" /></svg>
          <span className="absolute inset-0 rounded-full opacity-35 animate-ping bg-green-400" />
        </a>
      </div>

      {/* ── Chat Window ──────────────────────────────────────── */}
      <div
        className={`fixed z-[9998] flex flex-col overflow-hidden transition-all duration-500 ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto translate-y-0"
            : "opacity-0 scale-95 pointer-events-none translate-y-4"
        }`}
        style={{
          right: "80px",
          top: "50%",
          transform: isOpen ? "translateY(-50%) scale(1)" : "translateY(calc(-50% + 16px)) scale(0.97)",
          width: "min(428px, calc(100vw - 100px))",
          height: "min(580px, calc(100vh - 80px))",
          maxHeight: "calc(100vh - 40px)",
          borderRadius: "24px",
          boxShadow: "0 32px 80px rgba(11, 29, 62, 0.35), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          background: "rgba(248, 250, 252, 0.97)",
        }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div
          className="px-4 py-3.5 flex items-center gap-3 flex-shrink-0 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #060d1f 0%, #0f2d6b 45%, #1746b0 75%, #0e2752 100%)",
            borderRadius: "24px 24px 0 0",
          }}
        >
          {/* Animated shimmer line */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s infinite linear",
            }}
          />
          <style>{`
            @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
            @keyframes glow-pulse { 0%,100%{box-shadow:0 0 8px rgba(99,179,237,0.3)} 50%{box-shadow:0 0 18px rgba(99,179,237,0.6)} }
          `}</style>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-11 h-11 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-blue-400/40 shadow-xl"
              style={{ animation: "glow-pulse 2.5s infinite ease-in-out" }}
            >
              <img src="/images/redneck-avatar.png" alt="Redneck Ai" className="w-full h-full object-contain p-1" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0f2d6b] shadow-md" style={{ boxShadow: "0 0 8px rgba(52,211,153,0.7)" }} />
          </div>

          {/* Name + status */}
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm text-white tracking-wide leading-tight">Redneck Ai</p>
            <p className="text-[10px] text-blue-200/80 font-medium truncate mt-0.5">RAG-Powered Loan Advisor · Speedy Loan Finance</p>
          </div>

          {/* Live badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
            <span className="text-[10px] text-emerald-300 font-bold tracking-widest uppercase">Live</span>
          </div>

          {/* Clear button */}
          <button
            onClick={clearChat}
            title="Start over"
            className="flex-shrink-0 p-1.5 rounded-lg text-blue-200/50 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 6V4h10v2M5 6l1 14h12L19 6" />
            </svg>
          </button>
        </div>

        {/* ── Progress Bar ─────────────────────────────────── */}
        {isQuestionnaireActive && (
          <ProgressBar step={currentStep} loanType={userProfile.loanType} />
        )}

        {/* ── Sub-header (free text mode) ──────────────────── */}
        {!isQuestionnaireActive && (
          <div className="px-4 py-2 flex-shrink-0 bg-blue-50/70 dark:bg-slate-900/70 border-b border-blue-100/40 dark:border-slate-700/40">
            <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <span>🎯</span> Ask any question about loans, eligibility, documents & more
            </p>
          </div>
        )}

        {/* ── Messages Area ─────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 chat-messages-area"
          style={{
            background: "linear-gradient(180deg, #f0f4ff 0%, #e8eef8 50%, #f1f5fb 100%)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(99,130,200,0.2) transparent",
          }}
        >
          {/* Custom scrollbar + dark mode */}
          <style>{`
            .chat-messages-area::-webkit-scrollbar { width: 4px; }
            .chat-messages-area::-webkit-scrollbar-track { background: transparent; }
            .chat-messages-area::-webkit-scrollbar-thumb { background: rgba(99,130,200,0.25); border-radius: 4px; }
            .dark .chat-messages-area { background: linear-gradient(180deg, #0d1426 0%, #111827 50%, #0f172a 100%) !important; }
          `}</style>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Bot avatar */}
              {msg.role === "bot" && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-sm ring-2 ring-blue-500/15 bg-white flex items-center justify-center p-0.5">
                  <img src="/images/redneck-avatar.png" alt="Redneck Ai" className="w-full h-full object-contain" />
                </div>
              )}

              <div className="flex flex-col gap-0.5" style={{ maxWidth: "84%" }}>
                {/* Message bubble */}
                <div
                  className={`px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-2xl rounded-br-sm text-white"
                      : "rounded-2xl rounded-bl-sm text-slate-800 dark:text-slate-100"
                  }`}
                  style={msg.role === "user" ? {
                    background: "linear-gradient(135deg, #1a4fc7 0%, #3b3dd4 60%, #4f46e5 100%)",
                    boxShadow: "0 4px 20px rgba(27,79,199,0.35), 0 1px 0 rgba(255,255,255,0.1) inset",
                  } : {
                    background: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(203,213,225,0.7)",
                    boxShadow: "0 2px 12px rgba(15,30,70,0.08), 0 1px 0 rgba(255,255,255,0.8) inset",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div className={msg.role === "user" ? "[&_strong]:text-white" : "[&_strong]:text-slate-900 dark:[&_strong]:text-white"}>
                    {formatText(msg.text, msg.role === "user", userProfile)}
                  </div>
                </div>
                {/* Timestamp */}
                <p className={`text-[10px] font-medium tracking-wide ${msg.role === "user" ? "text-right text-slate-400" : "text-slate-400"}`}>
                  {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          {/* Questionnaire card */}
          {!isLoading && isQuestionnaireActive && (
            <div className="flex items-end gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-sm ring-2 ring-blue-500/15 bg-white flex items-center justify-center p-0.5">
                <img src="/images/redneck-avatar.png" alt="Redneck Ai" className="w-full h-full object-contain" />
              </div>
              
              {/* Language selection step */}
              {currentStep === "language_select" && (
                <LanguageSelectCard onSelect={(lang) => handleQuestionnaireSelect(lang, lang)} />
              )}

              {/* Normal questionnaire steps */}
              {currentStepIndex >= 0 && (
                <QuestionnaireCard
                  step={currentStep as Exclude<QuestionStep, "language_select" | "complete" | "freetext" | "cibil_estimator_prompt" | "cibil_estimator_q1" | "cibil_estimator_q2" | "cibil_estimator_q3">}
                  employmentType={userProfile.employmentType}
                  onSelect={handleQuestionnaireSelect}
                />
              )}

              {/* Estimator Prompt: Show Check Credit Score button */}
              {currentStep === "cibil_estimator_prompt" && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700 p-4 max-w-[92%] w-full">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-3 leading-snug">
                    Let's analyze your credit profile to estimate your score range.
                  </p>
                  <button
                    onClick={handleStartEstimator}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span>📊</span> Check Credit Score
                  </button>
                </div>
              )}

              {/* Estimator Question 1 */}
              {currentStep === "cibil_estimator_q1" && (
                <EstimatorQuestionCard
                  question="1. Have you ever delayed or missed any EMIs or credit card payments?"
                  options={[
                    { label: "Never delayed (Excellent profile)", points: 350 },
                    { label: "Rarely delayed (Good profile)", points: 250 },
                    { label: "Often delayed / Defaults (Poor profile)", points: 100 },
                    { label: "Never had a loan or credit card (New to credit)", points: 280 },
                  ]}
                  onSelect={(points, label) => handleEstimatorSelect(points, label, "cibil_estimator_q2")}
                />
              )}

              {/* Estimator Question 2 */}
              {currentStep === "cibil_estimator_q2" && (
                <EstimatorQuestionCard
                  question="2. What percentage of your credit card limit do you use monthly?"
                  options={[
                    { label: "Below 30% (Low usage)", points: 150 },
                    { label: "30% – 50% (Moderate usage)", points: 100 },
                    { label: "Above 50% (High usage)", points: 50 },
                    { label: "I don't have a credit card", points: 120 },
                  ]}
                  onSelect={(points, label) => handleEstimatorSelect(points, label, "cibil_estimator_q3")}
                />
              )}

              {/* Estimator Question 3 */}
              {currentStep === "cibil_estimator_q3" && (
                <EstimatorQuestionCard
                  question="3. Have you applied for multiple loans or credit cards in the last 3 months?"
                  options={[
                    { label: "No new applications (Excellent)", points: 100 },
                    { label: "1 or 2 applications (Moderate)", points: 70 },
                    { label: "3 or more applications (High risk)", points: 30 },
                  ]}
                  onSelect={(points, label) => handleEstimatorSelect(points, label, "complete")}
                />
              )}
            </div>
          )}

          {/* Quick action chips (post-questionnaire) */}
          {!isLoading && !isQuestionnaireActive && messages.length >= 3 && (
            <div className="pl-10">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2 font-medium">💡 Quick questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "📋 Documents needed", text: "What documents do I need for my loan?" },
                  { label: "📊 EMI calculation", text: "Calculate my EMI" },
                  { label: "🏦 Interest rates", text: "What are the current interest rates?" },
                  { label: "✅ Check eligibility", text: "Am I eligible for a loan?" },
                  { label: "📞 Contact office", text: "How can I contact Speedy Loan Finance?" },
                ].map(chip => (
                  <button
                    key={chip.label}
                    onClick={() => sendMessage(chip.text)}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-white/80 text-slate-600 dark:text-slate-300 transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      border: "1px solid rgba(148,168,220,0.4)",
                      boxShadow: "0 1px 4px rgba(15,30,70,0.08)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(27,79,199,0.2), 0 0 0 1px rgba(79,70,229,0.3)")}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,30,70,0.08)")}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ────────────────────────────────────── */}
        <div
          className="px-3 py-3 flex-shrink-0 border-t"
          style={{
            background: "rgba(255,255,255,0.95)",
            borderColor: "rgba(203,213,225,0.5)",
            backdropFilter: "blur(8px)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isQuestionnaireActive ? "Select option above or type..." : "Ask me anything about loans..."}
              disabled={isLoading}
              maxLength={500}
              className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none transition-all disabled:opacity-50 text-slate-900 placeholder-slate-400"
              style={{
                background: "rgba(241,245,255,0.8)",
                border: "1px solid rgba(148,168,220,0.4)",
                boxShadow: "0 1px 4px rgba(15,30,70,0.06) inset",
              }}
              onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.12), 0 1px 4px rgba(15,30,70,0.06) inset")}
              onBlur={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,30,70,0.06) inset")}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #1a4fc7 0%, #4f46e5 100%)",
                boxShadow: "0 4px 14px rgba(27,79,199,0.4)",
              }}
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </form>

          {/* Footer info */}
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[10px] text-slate-400">
              📞 <a href="tel:+917350005590" className="hover:text-blue-600 underline transition-colors font-medium">73500 05590</a>
              {" · "}Mon–Sat 9AM–7PM
            </p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />RAG-Powered AI
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
