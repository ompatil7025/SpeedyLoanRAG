// Server Component — metadata export requires this to stay a Server Component
import HeroSub from "@/components/SharedComponent/HeroSub";
import SchedulesContent from "./SchedulesContent";
import '@/Style/style.css';
import { Metadata } from "next";

// ─────────────────────────────────────────────────────────────────────────────
// METADATA – Loan Plans / Schedules: AEO | LLMO
// Targets: "types of loans in India", "best loan plans", "loan options Pune"
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "All Loan Types & Plans – Personal, Home, Business, MSME, LAP & More | Speedy Loan Finance Pune",
  description:
    "Explore all loan types at Speedy Loan Finance Services: Personal Loans, Home Loans, Business Loans, MSME Loans, Loan Against Property (LAP), Working Capital Loans, Car Loans, Education Loans, and Balance Transfer. Fast approvals, transparent terms, zero upfront fees in Pune.",
  keywords: [
    // Primary AEO keywords
    "types of loans in India",
    "all loan types Pune",
    "loan plans India 2026",
    "best loan options Pune",
    // Specific loan types
    "personal loan plans",
    "home loan plans Pune",
    "business loan options",
    "MSME loan types India",
    "loan against property Pune",
    "car loan Pune",
    "education loan India",
    "working capital loan India",
    "balance transfer loan",
    "best loan schemes India",
    // Comparison & intent queries
    "personal loan vs home loan India",
    "which loan is best for business",
    "MSME loan eligibility India",
    "fastest loan approval Pune",
    "zero fee loan consultant Pune",
  ],
  alternates: {
    canonical: "https://speedyloanfinance.com/schedules/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Speedy Loan Finance Services",
    title: "All Loan Types & Plans – Personal, Home, Business, MSME & More | Speedy Loan Finance Pune",
    description:
      "Personal, Home, Business, MSME, LAP, Working Capital, Car & Education Loans – all in one place. Fast approvals, zero fees. Pune's trusted loan DSA agent.",
    url: "https://speedyloanfinance.com/schedules/",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "All Loan Types – Speedy Loan Finance Pune" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@speedyloanfinance",
    title: "All Loan Types & Plans | Speedy Loan Finance Services Pune",
    description: "Personal, Home, Business, MSME, LAP, Car & Education Loans. Fast approval. Zero fees. Call 7350005590.",
    images: ["/logo.png"],
  },
};

const page = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/schedules", text: "Loan Plans" },
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
        "name": "All Loan Types & Plans",
        "item": "https://speedyloanfinance.com/schedules/"
      }
    ]
  };

  // ── 2. Loan Type Comparison Table (AEO-optimised) ───────────────────────────
  const loanTypesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://speedyloanfinance.com/schedules/#loan-types",
    "name": "Types of Loans Offered by Speedy Loan Finance Services",
    "description": "Complete list of loan products available through Speedy Loan Finance Services in Pune. Each loan type has specific eligibility, documentation, and repayment criteria.",
    "numberOfItems": 8,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "LoanOrCredit",
          "name": "Personal Loan",
          "description": "Unsecured personal loans for any personal need including medical emergencies, marriage, travel, home renovation, or debt consolidation. For salaried and self-employed individuals.",
          "url": "https://speedyloanfinance.com/blog/blog_1/",
          "loanType": "PersonalLoan",
          "currency": "INR",
          "amount": { "@type": "MonetaryAmount", "minValue": 50000, "maxValue": 5000000, "currency": "INR" },
          "loanRepaymentForm": "EMI",
          "requiredCollateral": "None – Unsecured",
          "loanTerm": { "@type": "QuantitativeValue", "minValue": 12, "maxValue": 84, "unitCode": "MON" }
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "LoanOrCredit",
          "name": "Home Loan",
          "description": "Long-term loans for purchasing, constructing, extending, or renovating residential property. Competitive interest rates through HDFC, SBI, ICICI, Axis, Kotak, and more.",
          "loanType": "HousingLoan",
          "currency": "INR",
          "loanRepaymentForm": "EMI",
          "loanTerm": { "@type": "QuantitativeValue", "minValue": 60, "maxValue": 360, "unitCode": "MON" }
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "LoanOrCredit",
          "name": "Business Loan",
          "description": "Unsecured or secured business loans for expansion, inventory, equipment, or working capital. For proprietors, partnerships, companies, and LLPs.",
          "url": "https://speedyloanfinance.com/blog/blog_2/",
          "loanType": "BusinessLoan",
          "currency": "INR",
          "amount": { "@type": "MonetaryAmount", "minValue": 100000, "maxValue": 75000000, "currency": "INR" },
          "loanRepaymentForm": "EMI",
          "loanTerm": { "@type": "QuantitativeValue", "minValue": 12, "maxValue": 84, "unitCode": "MON" }
        }
      },
      {
        "@type": "ListItem",
        "position": 4,
        "item": {
          "@type": "LoanOrCredit",
          "name": "MSME / SME Loan",
          "description": "Micro, Small and Medium Enterprise loans under government schemes and commercial products. For manufacturing, trading, and service-based MSMEs.",
          "loanType": "BusinessLoan",
          "currency": "INR",
          "loanRepaymentForm": "EMI"
        }
      },
      {
        "@type": "ListItem",
        "position": 5,
        "item": {
          "@type": "LoanOrCredit",
          "name": "Loan Against Property (LAP)",
          "description": "Secured loans against residential or commercial property. Higher loan amounts at lower interest rates compared to personal loans.",
          "loanType": "SecuredLoan",
          "currency": "INR",
          "amount": { "@type": "MonetaryAmount", "minValue": 500000, "maxValue": 100000000, "currency": "INR" },
          "loanRepaymentForm": "EMI",
          "requiredCollateral": "Residential or Commercial Property"
        }
      },
      {
        "@type": "ListItem",
        "position": 6,
        "item": {
          "@type": "LoanOrCredit",
          "name": "Working Capital Loan",
          "description": "Short-term business financing including Cash Credit, Overdraft, and term loans for managing day-to-day business operations.",
          "url": "https://speedyloanfinance.com/blog/blog_3/",
          "loanType": "BusinessLoan",
          "currency": "INR",
          "loanRepaymentForm": "Revolving Credit or EMI"
        }
      },
      {
        "@type": "ListItem",
        "position": 7,
        "item": {
          "@type": "LoanOrCredit",
          "name": "Balance Transfer",
          "description": "Transfer existing high-interest loans to a new lender at lower rates. Reduce EMI burden through competitive balance transfer offers.",
          "loanType": "RefinanceLoan",
          "currency": "INR"
        }
      },
      {
        "@type": "ListItem",
        "position": 8,
        "item": {
          "@type": "LoanOrCredit",
          "name": "Education Loan",
          "description": "Education loans for higher studies in India and abroad. Government-subsidized and commercial education loan options.",
          "loanType": "StudentLoan",
          "currency": "INR"
        }
      }
    ]
  };

  // ── 3. FAQ on Loan Types (AEO) ───────────────────────────────────────────────
  const loanTypeFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://speedyloanfinance.com/schedules/#faq",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the difference between a personal loan and a business loan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A personal loan is an unsecured loan for individual needs (medical, travel, education, etc.) based on personal income and credit score. A business loan is for business-related purposes (expansion, equipment, working capital) evaluated based on business turnover, profitability, and stability. Business loans generally have higher limits and may be secured or unsecured."
        }
      },
      {
        "@type": "Question",
        "name": "Which loan is best for buying a home in Pune?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A Home Loan is the best option for purchasing property in Pune. It offers the longest repayment tenure (up to 30 years), the lowest interest rates, and tax benefits under Section 80C and 24(b). Speedy Loan Finance Services can help you compare home loan rates from HDFC, SBI, ICICI, Axis, and Kotak to find the best deal."
        }
      },
      {
        "@type": "Question",
        "name": "What is an MSME loan and who is eligible?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An MSME loan is specifically designed for Micro, Small, and Medium Enterprises. Eligibility: your business must be registered as MSME/Udyam, typically operational for 2+ years, with a stable turnover. MSME loans can be availed under government schemes (CGTMSE, MUDRA) or commercial products from banks and NBFCs with competitive rates."
        }
      },
      {
        "@type": "Question",
        "name": "What is the maximum loan amount available through Speedy Loan Finance Services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Loan amounts vary by product: Personal Loans up to ₹50 lakhs, Home Loans up to ₹10 crores, Business/MSME Loans up to ₹7.5 crores, and Loan Against Property up to ₹10+ crores depending on property value. The exact amount is determined by your eligibility, income, and lender policies."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(loanTypesSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(loanTypeFaqSchema) }}
      />
      {/* Rendered server-side — instant, no JS needed */}
      <HeroSub
        title="Types Of Loans We Covered"
        description="Explore a wide range of loan solutions designed to meet personal, business, and property needs. Our services are crafted to offer fast approvals, transparent terms, and the best financial options from trusted lenders."
        breadcrumbLinks={breadcrumbLinks}
      />

      {/* Client Component handles all ssr:false dynamic imports */}
      <SchedulesContent />
    </>
  );
};

export default page;
