
import { Documentation } from "@/components/Documentation/Documentation";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const TicketSection = dynamic(() => import("@/components/Home/TicketSection"));
const Gst = dynamic(() => import("@/components/Home/Gst"));

// ─────────────────────────────────────────────────────────────────────────────
// METADATA – Documentation: AEO | LLMO | E-E-A-T
// Targets: "documents required for loan", "loan checklist India"
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Loan Documentation Guide – Documents Required for Personal, Home, Business & MSME Loans | Speedy Loan Finance",
  description:
    "Complete guide on documents required for all types of loans in India. Checklist for Personal Loan, Home Loan, Business Loan, MSME Loan, and Loan Against Property. GST documentation, KYC requirements, income proof, and bank statement requirements explained by Speedy Loan Finance Services, Pune.",
  keywords: [
    // AEO / AI answer queries
    "documents required for personal loan",
    "documents required for home loan",
    "documents required for business loan",
    "documents required for MSME loan",
    "loan documentation checklist India",
    "loan KYC documents India",
    "income proof for loan",
    "bank statement for loan",
    // GST-specific
    "GST loan India",
    "GST for business loan",
    "GST MSME documentation",
    "loan documentation list",
    "loan checklist India",
    // Long-tail
    "what documents needed for personal loan salaried",
    "self employed loan documents India",
    "loan application checklist Pune",
    "how to prepare documents for home loan",
    "MSME loan documents required India",
    "loan processing guide India",
  ],
  alternates: {
    canonical: "https://speedyloanfinance.com/documentation/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Speedy Loan Finance Services",
    title: "Loan Documentation Guide – Documents for Personal, Home, Business & MSME Loans",
    description:
      "Complete loan documentation requirements and GST guide for all loan types – Personal, Home, Business, MSME. Trusted guide from Speedy Loan Finance Services, Pune.",
    url: "https://speedyloanfinance.com/documentation/",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Loan Documentation Guide – Speedy Loan Finance Services" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@speedyloanfinance",
    title: "Loan Documentation Guide | Speedy Loan Finance Services",
    description: "Documents needed for Personal, Home, Business & MSME Loans. Expert guide from Pune's trusted loan DSA.",
    images: ["/logo.png"],
  },
};


export default function Page() {
  // ── 1. BreadcrumbList ────────────────────────────────────────────────────────
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://speedyloanfinance.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Loan Documentation Guide",
        "item": "https://speedyloanfinance.com/documentation/"
      }
    ]
  };

  // ── 2. Guide / HowTo Page Schema ────────────────────────────────────────────
  const guidePageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://speedyloanfinance.com/documentation/#webpage",
    "url": "https://speedyloanfinance.com/documentation/",
    "name": "Loan Documentation Guide – Complete Checklist for All Loan Types | Speedy Loan Finance",
    "description": "Comprehensive documentation guide covering KYC requirements, income proof, bank statements, and GST requirements for Personal, Home, Business, MSME, and LAP loans in India.",
    "inLanguage": "en-IN",
    "isPartOf": { "@id": "https://speedyloanfinance.com/#website" },
    "author": { "@id": "https://speedyloanfinance.com/#founder" },
    "about": [
      { "@type": "Thing", "name": "Loan Documentation", "description": "Documents required for loan application in India" },
      { "@type": "Thing", "name": "KYC Requirements", "description": "Know Your Customer requirements for bank loans" },
      { "@type": "Thing", "name": "Income Proof", "description": "Proof of income documents for loan eligibility" },
      { "@type": "Thing", "name": "GST Documentation", "description": "GST-related documents for business loan applications" }
    ]
  };

  // ── 3. Documentation FAQ Schema (AEO) ───────────────────────────────────────
  const documentationFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://speedyloanfinance.com/documentation/#faq",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What documents are required for a personal loan for salaried individuals?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For a personal loan (salaried): 1) Identity Proof: Aadhaar Card + PAN Card (mandatory), 2) Income Proof: Last 3 months salary slips, 3) Bank Statements: Last 3–6 months salary account statements, 4) Employment Proof: Employee ID card or appointment letter, 5) Address Proof: Aadhaar Card, utility bill, or passport (if different from Aadhaar)."
        }
      },
      {
        "@type": "Question",
        "name": "What documents are required for a personal loan for self-employed individuals?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For a personal loan (self-employed): 1) KYC: Aadhaar Card + PAN Card, 2) Income Proof: Last 2 years Income Tax Returns (ITR) with computation, 3) Financial Statements: Profit & Loss Statement and Balance Sheet (last 2 years), 4) Bank Statements: Last 6–12 months business bank statements, 5) Business Proof: GST certificate, Shop Act license, or MSME registration."
        }
      },
      {
        "@type": "Question",
        "name": "What documents are required for a home loan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For a home loan: 1) KYC: Aadhaar + PAN + Passport-size photos, 2) Income Proof: Salary slips (salaried) or ITR + P&L (self-employed), 3) Bank Statements: Last 6 months, 4) Property Documents: Sale agreement, property title deeds, NOC from builder, approved building plan, 5) Employment/Business Proof, 6) Existing loan statements (if any)."
        }
      },
      {
        "@type": "Question",
        "name": "What documents are required for a business loan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For a business loan: 1) KYC: Aadhaar + PAN of proprietor/partners/directors, 2) Business Registration: GST certificate, Shop Act, Partnership deed, or MOA/AOA, 3) Financial Documents: Last 2 years ITR, P&L Statement, Balance Sheet, 4) Bank Statements: Last 12 months business current account, 5) Business vintage proof (2+ years)."
        }
      },
      {
        "@type": "Question",
        "name": "Is GST registration required for a business loan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "GST registration is not always mandatory for a business loan, but it significantly strengthens the application. GST registration and returns (GSTR-1, GSTR-3B) serve as proof of business activity, turnover, and tax compliance. Most banks prefer GST-registered businesses for higher loan amounts. For small businesses below the GST threshold, alternative proof like Shop Act license or MSME registration is accepted."
        }
      },
      {
        "@type": "Question",
        "name": "What documents are required for MSME loan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For MSME loan: 1) Udyam Registration Certificate (mandatory for government MSME schemes), 2) KYC: Aadhaar + PAN of proprietor, 3) Business Proof: GST certificate, Shop Act license, 4) Financial Documents: Last 2–3 years ITR, P&L, Balance Sheet, 5) Bank Statements: Last 12 months, 6) Project report or business plan (for new machinery/equipment loans)."
        }
      }
    ]
  };

  // ── 4. Checklist ItemList Schema ────────────────────────────────────────────
  const checklistSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://speedyloanfinance.com/documentation/#checklist",
    "name": "Universal Loan Document Checklist",
    "description": "Essential documents required for loan applications across all major loan types in India",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Thing",
          "name": "Aadhaar Card",
          "description": "Mandatory KYC identity and address proof for all loan types"
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Thing",
          "name": "PAN Card",
          "description": "Mandatory for all loan applications above ₹50,000 for income tax linkage"
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "Thing",
          "name": "Income Proof (Salary Slips / ITR)",
          "description": "Last 3 months salary slips for salaried or last 2 years ITR for self-employed"
        }
      },
      {
        "@type": "ListItem",
        "position": 4,
        "item": {
          "@type": "Thing",
          "name": "Bank Statements",
          "description": "Last 3–12 months bank account statements showing regular income credits"
        }
      },
      {
        "@type": "ListItem",
        "position": 5,
        "item": {
          "@type": "Thing",
          "name": "Business Registration Proof",
          "description": "GST certificate, Shop Act license, MSME/Udyam registration for business loans"
        }
      },
      {
        "@type": "ListItem",
        "position": 6,
        "item": {
          "@type": "Thing",
          "name": "Property Documents",
          "description": "Required for Home Loan and Loan Against Property – title deeds, sale agreement, approved plans"
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guidePageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(documentationFaqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(checklistSchema) }}
      />
      <Documentation/>
      <Gst/>
      <TicketSection/>
    </>
  );
};
