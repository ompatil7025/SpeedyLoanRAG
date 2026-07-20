import { DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import type { Viewport } from "next";
import { ThemeProvider } from "next-themes";
import ScrollToTop from '@/components/ScrollToTop';
import Aoscompo from "@/utils/aos";
import SessionProviderComp from "@/components/nextauth/SessionProvider";
import { AuthDialogProvider } from "./context/AuthDialogContext";
const dmsans = DM_Sans({ subsets: ["latin"] });
import NextTopLoader from 'nextjs-toploader';
import type { Metadata } from "next";

// ─────────────────────────────────────────────────────────────────────────────
// VIEWPORT – Separate export (Next.js 15 requirement)
// ─────────────────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1B5BD1" },
    { media: "(prefers-color-scheme: dark)", color: "#1B5BD1" },
  ],
};
import LoanChatbot from "@/components/Chatbot";

// ─────────────────────────────────────────────────────────────────────────────
// METADATA  – AEO | GEO | LLMO | AISEO | E-E-A-T Expert-Level Configuration
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL("https://speedyloanfinance.com"),
  title: {
    default: "Speedy Loan Finance Services | Best Loan Agent in Pune – Personal, Home, Business & MSME Loans",
    template: "%s | Speedy Loan Finance Services",
  },
  description:
    "Speedy Loan Finance Services is Pune's most trusted loan DSA agent at Chinchwad offering fast approval on Personal Loans, Home Loans, Business Loans, MSME Loans, Loan Against Property, and Working Capital Loans through 15+ top banks and NBFCs including HDFC, ICICI, SBI, Axis, Kotak, and Bajaj Finserv. Zero upfront fees. Apply today.",
  keywords: [
    // Core service keywords
    "loan finance services",
    "loans near me",
    "best loan agent Pune",
    "personal loan Pune",
    "home loan Pune",
    "business loan Pune",
    "MSME loan Pune",
    "fast loan approval Pune",
    "loan DSA agent Pune",
    "instant loan approval",
    // GEO / local intent
    "loan agent Chinchwad",
    "loan services Pimpri",
    "loan agent Wakad",
    "loan services Hinjawadi",
    "loan near me Pune",
    "best loans Pune Maharashtra",
    "loan office Chinchwad railway station",
    "Mayur Trade Center loan",
    // Product-specific
    "personal loan without documents",
    "home loan low interest rate Pune",
    "business loan fast approval",
    "MSME loan government scheme",
    "loan against property Pune",
    "working capital loan India",
    "balance transfer loan",
    "car loan Pune",
    "education loan India",
    // Trust / E-E-A-T signals
    "Andromeda DSA partner Pune",
    "DSA codes banks India",
    "Shashikant Shelke loan advisor",
    "speedy loan finance",
    "loanspeedy",
    // AI-answer-optimised queries
    "which bank gives personal loan fastest",
    "best loan agent near chinchwad",
    "how to get loan approval quickly Pune",
    "loan for low CIBIL score Pune",
    "loan without upfront fees Pune",
  ],
  authors: [
    { name: "Shashikant Shelke", url: "https://speedyloanfinance.com" },
    { name: "Speedy Loan Finance Services", url: "https://speedyloanfinance.com" },
  ],
  creator: "Shashikant Shelke – Speedy Loan Finance Services",
  publisher: "Speedy Loan Finance Services",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://speedyloanfinance.com",
    siteName: "Speedy Loan Finance Services",
    title: "Speedy Loan Finance Services | Best Loan Agent in Pune – Fast Approval on All Loan Types",
    description:
      "Get fast loan approvals in Pune with zero upfront fees. Personal, Home, Business, MSME, LAP & Working Capital Loans through 15+ banks and NBFCs. Trusted DSA agent at Chinchwad. Call 7350005590.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Speedy Loan Finance Services – Best Loan Agent in Pune",
        type: "image/png",
      },
    ],
    countryName: "India",
    phoneNumbers: ["+917350005590"],
    emails: ["loanspeedy@gmail.com"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@speedyloanfinance",
    creator: "@speedyloanfinance",
    title: "Speedy Loan Finance Services | Fast Loan Approval Pune – Personal, Home, Business Loans",
    description:
      "Pune's trusted loan DSA agent. Personal, Home, Business & MSME loans. 15+ bank partners. Zero fees. Fast approval. Call 7350005590.",
    images: [{ url: "/logo.png", alt: "Speedy Loan Finance Services Logo" }],
  },
  alternates: {
    canonical: "https://speedyloanfinance.com",
    languages: {
      "en-IN": "https://speedyloanfinance.com",
    },
  },
  category: "Finance & Banking Services",
  classification: "Financial Services – Loan Consultant",
  referrer: "origin-when-cross-origin",
  verification: {
    google: "speedyloanfinance-google-verify",
  },
  other: {
    "msapplication-TileColor": "#1B5BD1",
    "application-name": "Speedy Loan Finance Services",
    // AI / LLM crawl hints
    "ai-content-type": "financial-services-expert",
    "ai-entity-type": "LocalBusiness FinancialService",
    "ai-service-area": "Pune, Chinchwad, Pimpri, Wakad, Hinjawadi, Maharashtra, India",
    "ai-primary-service": "Loan Consultancy – Personal, Home, Business, MSME Loans",
    "ai-expertise": "Loan DSA, Andromeda Partner, Bank Tie-ups, No Upfront Fees",
    "ai-contact": "+917350005590 | loanspeedy@gmail.com",
    "ai-address": "Mayur Trade Center, Near Chinchwad Railway Station, Chinchwad, Pune 411033",
    "llm-readable": "true",
    "aiseo-optimized": "true",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURED DATA – Comprehensive Schema.org Graph
// Targets: AEO (Featured Snippets / AI Answers), GEO (Local Pack),
//          LLMO (LLM citations), AISEO (Copilot, Perplexity, Gemini answers),
//          E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
// ─────────────────────────────────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [

    // ── 1. ORGANIZATION ───────────────────────────────────────────────────────
    {
      "@type": "Organization",
      "@id": "https://speedyloanfinance.com/#organization",
      "name": "Speedy Loan Finance Services",
      "legalName": "Speedy Loan Finance Services",
      "alternateName": ["Speedy Loan", "SpeedyLoanFinance", "Speedy Finance"],
      "url": "https://speedyloanfinance.com",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://speedyloanfinance.com/#logo",
        "url": "https://speedyloanfinance.com/logo.png",
        "contentUrl": "https://speedyloanfinance.com/logo.png",
        "width": 512,
        "height": 512,
        "caption": "Speedy Loan Finance Services – Trusted Loan Agent in Pune"
      },
      "image": { "@id": "https://speedyloanfinance.com/#logo" },
      "description": "Speedy Loan Finance Services is a leading loan DSA consultancy in Pune (Chinchwad, Maharashtra) offering fast, transparent, and trusted loan solutions. We are an Andromeda DSA partner with tie-ups to 15+ major banks and NBFCs including HDFC, ICICI, SBI, Axis, Kotak, Bajaj Finserv, and Tata Capital. We offer Personal Loans, Home Loans, Business Loans, MSME Loans, Loan Against Property, and Working Capital Loans with zero upfront fees.",
      "telephone": "+917350005590",
      "email": "loanspeedy@gmail.com",
      "foundingDate": "2020",
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "value": "5"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Mayur Trade Center, Near Chinchwad Railway Station",
        "addressLocality": "Chinchwad",
        "addressRegion": "Maharashtra",
        "postalCode": "411033",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 18.6526,
        "longitude": 73.7968
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+917350005590",
          "contactType": "customer service",
          "contactOption": "TollFree",
          "areaServed": ["IN-MH"],
          "availableLanguage": ["English", "Hindi", "Marathi"],
          "hoursAvailable": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "09:00",
            "closes": "19:00"
          }
        },
        {
          "@type": "ContactPoint",
          "email": "loanspeedy@gmail.com",
          "contactType": "loan enquiry",
          "areaServed": "IN"
        }
      ],
      "sameAs": [
        "https://www.instagram.com/speedyloanfinance/",
        "https://wa.me/917350005590"
      ],
      "knowsAbout": [
        "Personal Loans", "Home Loans", "Business Loans", "MSME Loans",
        "Loan Against Property", "Working Capital Loans", "Balance Transfer",
        "DSA Codes", "Andromeda DSA", "CIBIL Score", "Loan Eligibility",
        "Loan Documentation", "Bank Partnerships", "NBFC Loans"
      ],
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "name": "Andromeda DSA Partner",
        "credentialCategory": "Professional Certification",
        "recognizedBy": {
          "@type": "Organization",
          "name": "Andromeda Loans India"
        }
      }
    },

    // ── 2. FINANCIAL SERVICE (Local Business) ─────────────────────────────────
    {
      "@type": ["FinancialService", "LocalBusiness", "ProfessionalService"],
      "@id": "https://speedyloanfinance.com/#financial_service",
      "name": "Speedy Loan Finance Services",
      "legalName": "Speedy Loan Finance Services",
      "description": "Pune's most trusted loan DSA agent offering fast approval on Personal Loans, Home Loans, Business Loans, MSME Loans, Loan Against Property, and Working Capital Loans through 15+ top banks and NBFCs. Zero upfront fees. Located near Chinchwad Railway Station, Pune.",
      "url": "https://speedyloanfinance.com",
      "logo": "https://speedyloanfinance.com/logo.png",
      "image": "https://speedyloanfinance.com/logo.png",
      "telephone": "+917350005590",
      "email": "loanspeedy@gmail.com",
      "foundingDate": "2020",
      "priceRange": "Free Consultation – No Upfront Fees",
      "currenciesAccepted": "INR",
      "paymentAccepted": ["Bank Transfer", "NEFT", "RTGS", "UPI"],
      "isAccessibleForFree": true,
      "parentOrganization": { "@id": "https://speedyloanfinance.com/#organization" },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Mayur Trade Center, Near Chinchwad Railway Station",
        "addressLocality": "Chinchwad",
        "addressRegion": "Maharashtra",
        "postalCode": "411033",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 18.6526,
        "longitude": 73.7968
      },
      "hasMap": "https://maps.google.com/?q=Mayur+Trade+Center,+Chinchwad,+Pune",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "09:00",
          "closes": "19:00"
        }
      ],
      "specialOpeningHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Sunday",
          "opens": "10:00",
          "closes": "14:00",
          "validFrom": "2026-01-01",
          "validThrough": "2026-12-31"
        }
      ],
      "areaServed": [
        {
          "@type": "City",
          "name": "Pune",
          "sameAs": "https://en.wikipedia.org/wiki/Pune"
        },
        {
          "@type": "Place",
          "name": "Chinchwad",
          "address": { "@type": "PostalAddress", "addressLocality": "Chinchwad", "addressRegion": "Maharashtra", "addressCountry": "IN" }
        },
        {
          "@type": "Place",
          "name": "Pimpri",
          "address": { "@type": "PostalAddress", "addressLocality": "Pimpri", "addressRegion": "Maharashtra", "addressCountry": "IN" }
        },
        {
          "@type": "Place",
          "name": "Wakad",
          "address": { "@type": "PostalAddress", "addressLocality": "Wakad", "addressRegion": "Maharashtra", "addressCountry": "IN" }
        },
        {
          "@type": "Place",
          "name": "Hinjawadi",
          "address": { "@type": "PostalAddress", "addressLocality": "Hinjawadi", "addressRegion": "Maharashtra", "addressCountry": "IN" }
        },
        {
          "@type": "Place",
          "name": "Ravet",
          "address": { "@type": "PostalAddress", "addressLocality": "Ravet", "addressRegion": "Maharashtra", "addressCountry": "IN" }
        },
        {
          "@type": "Place",
          "name": "Sangvi",
          "address": { "@type": "PostalAddress", "addressLocality": "Sangvi", "addressRegion": "Maharashtra", "addressCountry": "IN" }
        },
        {
          "@type": "Place",
          "name": "Bhosari",
          "address": { "@type": "PostalAddress", "addressLocality": "Bhosari", "addressRegion": "Maharashtra", "addressCountry": "IN" }
        }
      ],
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 18.6526,
          "longitude": 73.7968
        },
        "geoRadius": "50000"
      },
      "sameAs": [
        "https://www.instagram.com/speedyloanfinance/",
        "https://wa.me/917350005590"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Loan Products & Financial Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "Personal Loan",
            "description": "Unsecured personal loans with fast approval, minimal documentation, and competitive interest rates for salaried and self-employed individuals in Pune.",
            "url": "https://speedyloanfinance.com/blog/blog_1/",
            "category": "Personal Finance",
            "eligibleCustomerType": "Individual",
            "areaServed": "Pune, Maharashtra",
            "itemOffered": {
              "@type": "LoanOrCredit",
              "name": "Personal Loan",
              "loanType": "PersonalLoan",
              "currency": "INR",
              "amount": { "@type": "MonetaryAmount", "minValue": 50000, "maxValue": 5000000, "currency": "INR" },
              "loanRepaymentForm": "EMI"
            }
          },
          {
            "@type": "Offer",
            "name": "Home Loan",
            "description": "Home loans at competitive rates through top banks and NBFCs for buying, constructing, or renovating property in Pune.",
            "category": "Home Finance",
            "eligibleCustomerType": "Individual",
            "areaServed": "Pune, Maharashtra",
            "itemOffered": {
              "@type": "LoanOrCredit",
              "name": "Home Loan",
              "loanType": "HousingLoan",
              "currency": "INR",
              "loanRepaymentForm": "EMI"
            }
          },
          {
            "@type": "Offer",
            "name": "Business Loan",
            "description": "Fast business loans for SMEs, startups and proprietors. Quick approval with minimal documentation through multiple bank partners.",
            "url": "https://speedyloanfinance.com/blog/blog_2/",
            "category": "Business Finance",
            "eligibleCustomerType": "Business",
            "areaServed": "Pune, Maharashtra",
            "itemOffered": {
              "@type": "LoanOrCredit",
              "name": "Business Loan",
              "loanType": "BusinessLoan",
              "currency": "INR",
              "loanRepaymentForm": "EMI"
            }
          },
          {
            "@type": "Offer",
            "name": "MSME / SME Loan",
            "description": "Government-backed and commercial MSME loans for micro, small, and medium enterprises through scheduled banks and NBFCs.",
            "category": "MSME Finance",
            "eligibleCustomerType": "Business",
            "areaServed": "India",
            "itemOffered": {
              "@type": "LoanOrCredit",
              "name": "MSME Loan",
              "loanType": "BusinessLoan",
              "currency": "INR",
              "loanRepaymentForm": "EMI"
            }
          },
          {
            "@type": "Offer",
            "name": "Loan Against Property (LAP)",
            "description": "Mortgage loans against residential or commercial property in Pune. High loan amounts at attractive interest rates.",
            "category": "Secured Finance",
            "itemOffered": {
              "@type": "LoanOrCredit",
              "name": "Loan Against Property",
              "loanType": "SecuredLoan",
              "currency": "INR",
              "loanRepaymentForm": "EMI"
            }
          },
          {
            "@type": "Offer",
            "name": "Working Capital Loan",
            "description": "Working capital solutions including Cash Credit, Overdraft, and short-term business loans to ensure smooth business operations.",
            "url": "https://speedyloanfinance.com/blog/blog_3/",
            "category": "Business Finance",
            "itemOffered": {
              "@type": "LoanOrCredit",
              "name": "Working Capital Loan",
              "loanType": "BusinessLoan",
              "currency": "INR"
            }
          },
          {
            "@type": "Offer",
            "name": "Balance Transfer",
            "description": "Transfer your existing high-interest loans to a new bank at lower interest rates with better terms and reduced EMIs.",
            "category": "Loan Refinancing",
            "itemOffered": {
              "@type": "Service",
              "name": "Loan Balance Transfer",
              "serviceType": "Refinancing"
            }
          },
          {
            "@type": "Offer",
            "name": "Insurance & Investment Advisory",
            "description": "Insurance and investment planning advisory services for individuals and businesses in Pune.",
            "category": "Financial Advisory",
            "itemOffered": {
              "@type": "Service",
              "name": "Insurance & Investment Advisory"
            }
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": "127",
        "reviewCount": "127"
      },
      "review": [
        {
          "@type": "Review",
          "author": { "@type": "Person", "name": "Rahul Sharma" },
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "reviewBody": "Got my personal loan approved within 48 hours. Speedy Loan Finance team was very professional and transparent about all charges. Highly recommended!",
          "datePublished": "2026-05-10"
        },
        {
          "@type": "Review",
          "author": { "@type": "Person", "name": "Priya Deshmukh" },
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "reviewBody": "Best loan agent in Chinchwad. No upfront fees, fast processing, and great service. They helped me get a home loan with the best interest rate.",
          "datePublished": "2026-04-22"
        },
        {
          "@type": "Review",
          "author": { "@type": "Person", "name": "Amit Kulkarni" },
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "reviewBody": "Excellent service for MSME loan. Very knowledgeable team, helped us choose the right lender and got the loan disbursed quickly.",
          "datePublished": "2026-03-15"
        }
      ]
    },

    // ── 3. PERSON (Expert / E-E-A-T Author Signal) ────────────────────────────
    {
      "@type": "Person",
      "@id": "https://speedyloanfinance.com/#founder",
      "name": "Shashikant Shelke",
      "jobTitle": "Loan Consultant & DSA Partner",
      "description": "Shashikant Shelke is a certified loan consultant and Andromeda DSA partner based in Chinchwad, Pune with expertise in personal loans, home loans, business loans, and MSME financing. He has helped 1000+ clients secure loans through India's leading banks and NBFCs.",
      "url": "https://speedyloanfinance.com",
      "telephone": "+917350005590",
      "email": "loanspeedy@gmail.com",
      "worksFor": { "@id": "https://speedyloanfinance.com/#organization" },
      "knowsAbout": [
        "Personal Loan Eligibility", "Home Loan Process", "Business Loan Documentation",
        "MSME Financing", "CIBIL Score Improvement", "Loan Against Property",
        "DSA Codes", "Andromeda Loan Platform", "Bank Lending Criteria"
      ],
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "name": "Andromeda DSA Certified Loan Partner",
        "credentialCategory": "Professional Certification"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Chinchwad",
        "addressRegion": "Maharashtra",
        "addressCountry": "IN"
      },
      "sameAs": [
        "https://www.instagram.com/speedyloanfinance/",
        "https://wa.me/917350005590"
      ]
    },

    // ── 4. WEBSITE with SearchAction ─────────────────────────────────────────
    {
      "@type": "WebSite",
      "@id": "https://speedyloanfinance.com/#website",
      "url": "https://speedyloanfinance.com",
      "name": "Speedy Loan Finance Services",
      "description": "Official website of Speedy Loan Finance Services – Pune's trusted loan DSA consultancy for Personal, Home, Business, MSME loans.",
      "inLanguage": "en-IN",
      "publisher": { "@id": "https://speedyloanfinance.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://speedyloanfinance.com/blog/?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },

    // ── 5. FAQ PAGE (AEO – Featured Snippets & AI Answers) ───────────────────
    {
      "@type": "FAQPage",
      "@id": "https://speedyloanfinance.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What types of loans does Speedy Loan Finance Services offer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Speedy Loan Finance Services offers Personal Loans, Home Loans, Business Loans, MSME/SME Loans, Loan Against Property (LAP), Working Capital Loans (Cash Credit, Overdraft), Balance Transfer, and Insurance & Investment advisory. All loans are processed through 15+ major banks and NBFCs including HDFC Bank, ICICI Bank, SBI, Axis Bank, Kotak Mahindra Bank, Bajaj Finserv, Tata Capital, and more."
          }
        },
        {
          "@type": "Question",
          "name": "Where is Speedy Loan Finance Services located?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Speedy Loan Finance Services is located at Mayur Trade Center, Near Chinchwad Railway Station, Chinchwad, Pune, Maharashtra – 411033. We serve clients across Pune, Chinchwad, Pimpri, Wakad, Hinjawadi, Ravet, Sangvi, and Bhosari."
          }
        },
        {
          "@type": "Question",
          "name": "Does Speedy Loan Finance charge any upfront fees?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Speedy Loan Finance Services does NOT charge any upfront or processing fees from clients. Our consultation and loan guidance service is completely free. Any processing charges are levied directly by the bank or NBFC only after loan approval and disbursal."
          }
        },
        {
          "@type": "Question",
          "name": "Which banks and NBFCs are associated with Speedy Loan Finance Services?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Speedy Loan Finance Services has partnerships with 15+ leading financial institutions including HDFC Bank, ICICI Bank, State Bank of India (SBI), Bank of India, Kotak Mahindra Bank, Axis Bank, Federal Bank, YES Bank, Punjab National Bank (PNB), Bank of Baroda, Tata Capital, Bajaj Finserv, IIFL Finance, UGRO Capital, and RBL Bank through the Andromeda DSA platform."
          }
        },
        {
          "@type": "Question",
          "name": "What is the minimum CIBIL score required for a personal loan in Pune?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A CIBIL score of 750 or above is ideal for personal loan approval and gives you access to the best interest rates. Scores between 700–749 have good approval chances. Scores of 600–699 may still qualify depending on income, employment stability, and lender policies. Speedy Loan Finance Services helps customers with all CIBIL profiles find the right lender."
          }
        },
        {
          "@type": "Question",
          "name": "How fast can I get a loan approved through Speedy Loan Finance Services?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Personal loans can be approved and disbursed within 24–72 hours for salaried employees with a strong CIBIL score. Business and MSME loans typically take 3–7 working days depending on documentation. Home loans may take 7–15 working days for complete processing. Speedy Loan Finance Services fast-tracks applications through its established bank relationships."
          }
        },
        {
          "@type": "Question",
          "name": "Which areas in Pune does Speedy Loan Finance Services serve?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Speedy Loan Finance Services serves all major areas of Pune including Chinchwad, Pimpri, Wakad, Hinjawadi, Ravet, Sangvi, Bhosari, Kothrud, Baner, Aundh, Shivajinagar, Hadapsar, Viman Nagar, Kharadi, and the entire Pune Metropolitan Region."
          }
        },
        {
          "@type": "Question",
          "name": "What documents are required for a personal loan?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For a personal loan, salaried applicants need: Aadhaar Card, PAN Card, last 3 months salary slips, last 3-6 months bank statements, and employee ID. Self-employed applicants need: Aadhaar Card, PAN Card, last 2 years ITR, Profit & Loss statement, Balance Sheet, and business bank statements. Speedy Loan Finance Services guides you through every document requirement."
          }
        },
        {
          "@type": "Question",
          "name": "Is Speedy Loan Finance Services a registered DSA?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Speedy Loan Finance Services is a certified Andromeda DSA (Direct Selling Agent) partner, which is India's largest loan distribution network. This gives our clients access to loan products from 200+ banks and NBFCs with exclusive rates and faster processing."
          }
        },
        {
          "@type": "Question",
          "name": "Can I get a loan with low CIBIL score or no credit history?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, in many cases. Speedy Loan Finance Services works with lenders who offer loans to applicants with lower CIBIL scores or thin credit files, especially if you have a stable income, good banking history, or collateral. Some NBFCs offer loans to first-time borrowers with no credit history based on income and employment stability."
          }
        }
      ]
    },

    // ── 6. SPEAKABLE (AI voice search + Google Speakable) ─────────────────────
    {
      "@type": "SpeakableSpecification",
      "@id": "https://speedyloanfinance.com/#speakable",
      "cssSelector": ["h1", "h2", ".loan-summary", ".faq-answer"]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* ── Primary Structured Data ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* ── GEO / Local SEO Meta Tags ── */}
        <meta name="geo.region" content="IN-MH" />
        <meta name="geo.placename" content="Chinchwad, Pune, Maharashtra, India" />
        <meta name="geo.position" content="18.6526;73.7968" />
        <meta name="ICBM" content="18.6526, 73.7968" />

        {/* ── PWA / Mobile App Meta Tags ── */}
        <meta name="theme-color" content="#1B5BD1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Speedy Loan" />

        {/* ── AI / LLM Answer Engine Meta Tags ── */}
        <meta name="ai-content-declaration" content="expert-financial-services" />
        <meta name="content-language" content="en-IN" />
        <meta name="subject" content="Loan Finance Services Pune – Personal, Home, Business, MSME Loans" />
        <meta name="abstract" content="Speedy Loan Finance Services provides fast loan approvals in Pune with zero upfront fees through 15+ bank and NBFC partnerships." />
        <meta name="topic" content="Loan Consultancy, Financial Services, DSA Agent, Pune" />
        <meta name="summary" content="Trusted loan DSA agent in Chinchwad, Pune offering personal, home, business, MSME loans and more with fast approval and zero upfront fees." />
        <meta name="classification" content="Finance, Loan Services, Banking, Financial Consultancy" />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="3 days" />

        {/* ── Manifest & Preconnects ── */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={dmsans.className}>
      <AuthDialogProvider>
      <SessionProviderComp session={undefined}>
        <ThemeProvider
          attribute="class"
          enableSystem={true}
          defaultTheme="system"
        >
          <Aoscompo>
            <Header />
            <NextTopLoader />
            {children}
            <Footer />
          </Aoscompo>
          <ScrollToTop />
          <LoanChatbot />
        </ThemeProvider>
        </SessionProviderComp>
        </AuthDialogProvider>
      </body>
    </html>
  );
}
