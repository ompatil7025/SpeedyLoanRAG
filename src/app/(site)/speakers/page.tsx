import HeroSub from "@/components/SharedComponent/HeroSub";
import React from "react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const Testimonials = dynamic(() => import("@/components/Home/Testimonials"));
const Andro = dynamic(() => import("@/components/Home/Andro"));
const ICICI = dynamic(() => import("@/components/Home/ICICI"));
const LocationSecCode = dynamic(() => import("@/components/Home/LocationSecCode"));
const TicketSection = dynamic(() => import("@/components/Home/TicketSection"));
const WorkSpeakers = dynamic(() => import("@/components/Home/WorkSpeakers"));

// ─────────────────────────────────────────────────────────────────────────────
// METADATA – Bankers Panel: E-E-A-T | AEO | LLMO
// Targets: "Andromeda DSA codes", "bank DSA codes list", "loan partner banks"
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Bankers Panel – DSA Codes, Bank One-Pagers & 15+ Partner Banks | Speedy Loan Finance",
  description:
    "Access Andromeda DSA codes for 200+ banks and NBFCs including ICICI, Axis, HDFC, Bajaj Finserv, SBI, Kotak, Tata Capital, IIFL, and more. Download bank one-pagers and location-wise DSA codes for fast loan processing. Speedy Loan Finance is a certified Andromeda DSA partner in Pune.",
  keywords: [
    "Andromeda DSA codes",
    "bank DSA codes list India",
    "ICICI bank DSA code",
    "Bajaj Finance DSA code",
    "Axis bank DSA code",
    "HDFC bank DSA code",
    "SBI DSA code",
    "Kotak Mahindra DSA code",
    "loan broker codes India",
    "Andromeda location sec code",
    "Andromeda DSA partner Pune",
    "DSA agent loan India",
    "bank one-pager loan",
    "NBFC DSA codes",
    "Tata Capital DSA",
    "Bajaj Finserv DSA",
    "loan partner bank Pune",
    "certified DSA agent Maharashtra",
  ],
  alternates: {
    canonical: "https://speedyloanfinance.com/speakers/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Speedy Loan Finance Services",
    title: "Bankers Panel – DSA Codes & Bank One-Pagers | Speedy Loan Finance",
    description:
      "Find Andromeda DSA codes for 200+ banks and NBFCs. Access bank one-pagers for HDFC, ICICI, SBI, Axis, Kotak, Bajaj Finserv, and more. Certified Andromeda DSA partner.",
    url: "https://speedyloanfinance.com/speakers/",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Bankers Panel – Speedy Loan Finance Services" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@speedyloanfinance",
    title: "Bankers Panel – DSA Codes & Bank One-Pagers | Speedy Loan Finance",
    description: "Andromeda DSA codes for 200+ banks. One-pagers for HDFC, ICICI, SBI, Axis, Bajaj & more.",
    images: ["/logo.png"],
  },
};


const page = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/speakers", text: "Bankers Panel" },
  ];

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
        "name": "Bankers Panel – DSA Codes & One-Pagers",
        "item": "https://speedyloanfinance.com/speakers/"
      }
    ]
  };

  // ── 2. WebPage + Bank Partners Schema ────────────────────────────────────────
  const bankersSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://speedyloanfinance.com/speakers/#webpage",
    "url": "https://speedyloanfinance.com/speakers/",
    "name": "Bankers Panel – DSA Codes, One-Pagers & Partner Banks | Speedy Loan Finance",
    "description": "Access DSA codes, bank guidelines, and processing one-pagers for 15+ leading Indian banks and NBFCs through Andromeda DSA platform. Speedy Loan Finance Services is a certified DSA partner.",
    "inLanguage": "en-IN",
    "isPartOf": {
      "@id": "https://speedyloanfinance.com/#website"
    },
    "about": {
      "@type": "ItemList",
      "name": "Associated Banks and NBFC Partners",
      "description": "Complete list of banks and NBFCs partnered with Speedy Loan Finance Services through Andromeda DSA platform for loan processing.",
      "numberOfItems": 15,
      "itemListElement": [
        {
          "@type": "ListItem", "position": 1,
          "item": {
            "@type": "BankOrCreditUnion",
            "name": "HDFC Bank",
            "description": "India's largest private sector bank offering personal, home, and business loans.",
            "url": "https://www.hdfcbank.com"
          }
        },
        {
          "@type": "ListItem", "position": 2,
          "item": {
            "@type": "BankOrCreditUnion",
            "name": "State Bank of India (SBI)",
            "description": "India's largest public sector bank offering a wide range of loan products.",
            "url": "https://www.onlinesbi.sbi"
          }
        },
        {
          "@type": "ListItem", "position": 3,
          "item": {
            "@type": "BankOrCreditUnion",
            "name": "ICICI Bank",
            "description": "Leading private sector bank with comprehensive personal and business loan offerings.",
            "url": "https://www.icicibank.com"
          }
        },
        {
          "@type": "ListItem", "position": 4,
          "item": {
            "@type": "BankOrCreditUnion",
            "name": "Axis Bank",
            "description": "Private sector bank offering personal, home, MSME, and business loans.",
            "url": "https://www.axisbank.com"
          }
        },
        {
          "@type": "ListItem", "position": 5,
          "item": {
            "@type": "BankOrCreditUnion",
            "name": "Kotak Mahindra Bank",
            "description": "Private sector bank known for competitive rates on personal and business loans.",
            "url": "https://www.kotak.com"
          }
        },
        {
          "@type": "ListItem", "position": 6,
          "item": {
            "@type": "BankOrCreditUnion",
            "name": "Bank of India",
            "description": "Public sector bank offering personal, home, and MSME loans across India.",
            "url": "https://www.bankofindia.co.in"
          }
        },
        {
          "@type": "ListItem", "position": 7,
          "item": {
            "@type": "BankOrCreditUnion",
            "name": "Central Bank of India",
            "description": "Government-owned bank providing affordable loan products.",
            "url": "https://www.centralbankofindia.co.in"
          }
        },
        {
          "@type": "ListItem", "position": 8,
          "item": {
            "@type": "BankOrCreditUnion",
            "name": "Federal Bank",
            "description": "Private sector bank offering personal, home, and MSME loans.",
            "url": "https://www.federalbank.co.in"
          }
        },
        {
          "@type": "ListItem", "position": 9,
          "item": {
            "@type": "FinancialService",
            "name": "UGRO Capital",
            "description": "NBFC specializing in MSME and small business financing."
          }
        },
        {
          "@type": "ListItem", "position": 10,
          "item": {
            "@type": "BankOrCreditUnion",
            "name": "Bank of Baroda",
            "description": "Public sector bank with broad loan product offerings.",
            "url": "https://www.bankofbaroda.in"
          }
        },
        {
          "@type": "ListItem", "position": 11,
          "item": {
            "@type": "BankOrCreditUnion",
            "name": "YES Bank",
            "description": "Private sector bank offering personal, home, and business loans.",
            "url": "https://www.yesbank.in"
          }
        },
        {
          "@type": "ListItem", "position": 12,
          "item": {
            "@type": "FinancialService",
            "name": "Tata Capital",
            "description": "Leading NBFC offering personal, home, and business loans.",
            "url": "https://www.tatacapital.com"
          }
        },
        {
          "@type": "ListItem", "position": 13,
          "item": {
            "@type": "FinancialService",
            "name": "Bajaj Finserv",
            "description": "India's leading NBFC offering instant personal, business, and consumer loans.",
            "url": "https://www.bajajfinserv.in"
          }
        },
        {
          "@type": "ListItem", "position": 14,
          "item": {
            "@type": "BankOrCreditUnion",
            "name": "Punjab National Bank (PNB)",
            "description": "Public sector bank with affordable personal and home loan rates.",
            "url": "https://www.pnbindia.in"
          }
        },
        {
          "@type": "ListItem", "position": 15,
          "item": {
            "@type": "FinancialService",
            "name": "IIFL Finance",
            "description": "NBFC offering personal, home, business, and gold loans.",
            "url": "https://www.iifl.com"
          }
        }
      ]
    },
    "mainEntity": {
      "@id": "https://speedyloanfinance.com/#financial_service"
    }
  };

  // ── 3. Credential / Andromeda Partnership FAQ ────────────────────────────────
  const partnershipFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://speedyloanfinance.com/speakers/#faq",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is an Andromeda DSA partner?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Andromeda Loans is India's largest loan distribution network. A certified Andromeda DSA (Direct Selling Agent) partner has access to loan products from 200+ banks and NBFCs, exclusive processing support, and dedicated bank relationships. Speedy Loan Finance Services is a certified Andromeda DSA partner in Pune, Maharashtra."
        }
      },
      {
        "@type": "Question",
        "name": "Which banks does Speedy Loan Finance Services work with?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Speedy Loan Finance Services partners with 15+ major banks and NBFCs: HDFC Bank, ICICI Bank, State Bank of India (SBI), Axis Bank, Kotak Mahindra Bank, Bank of India, Central Bank of India, Federal Bank, Bank of Baroda, YES Bank, Punjab National Bank (PNB), Tata Capital, Bajaj Finserv, UGRO Capital, IIFL Finance, and RBL Bank."
        }
      },
      {
        "@type": "Question",
        "name": "What are DSA codes in loan processing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DSA codes are unique identification codes assigned to Direct Selling Agents (DSAs) by banks and NBFCs. These codes are used to track loan applications submitted through DSA channels, ensure proper commission structure, and fast-track processing. Speedy Loan Finance Services has active DSA codes with 15+ lenders for quick loan submission and processing."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bankersSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(partnershipFaqSchema) }}
      />
      <HeroSub
        title="OnePagers of Banks & Andro Codes"
        description="Access one-pagers of various banks and NBFC partners along with their Andromeda DSA codes. This section helps loan advisors quickly find lender details, product information, and processing guidelines in one place."
        breadcrumbLinks={breadcrumbLinks}
      />
      <WorkSpeakers showTitle={false} />
      <Andro/>
      <ICICI/>
      <LocationSecCode/>
      <Testimonials/>
      <TicketSection/>
    </>
  );
};

export default page;
