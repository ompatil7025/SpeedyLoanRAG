import Hero from '@/components/Home/Hero';
import HeroSub from "@/components/SharedComponent/HeroSub";
import dynamic from "next/dynamic";
import { Metadata } from "next";

const ThumbnailCarousel = dynamic(() => import('@/components/Home/Conferences'));
const BlogList = dynamic(() => import('@/components/Blog/BlogList'));
const WorkSpeakers = dynamic(() => import('@/components/Home/WorkSpeakers'));
const EventTicket = dynamic(() => import('@/components/Home/EventTicket'));
const Highlight = dynamic(() => import('@/components/Home/YearHighlight/page'));
const Upcoming = dynamic(() => import('@/components/Home/Upcoming'));
const Testimonials = dynamic(() => import('@/components/Home/Testimonials'));
const TicketSection = dynamic(() => import('@/components/Home/TicketSection'));

// ─────────────────────────────────────────────────────────────────────────────
// METADATA – Homepage: AEO | GEO | LLMO | AISEO | E-E-A-T
// Targets: "loans near me", "best loans Pune", "best loan agent Pune"
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Speedy Loan Finance Services | Best Loan Agent in Pune – Personal, Home, Business & MSME Loans Near You",
  description:
    "Looking for loans near you in Pune? Speedy Loan Finance Services at Chinchwad offers fast approval on Personal Loans, Home Loans, Business Loans, MSME Loans, LAP & Working Capital Loans. Zero upfront fees. 15+ bank partners. Call 7350005590.",
  keywords: [
    // High-intent AI search queries
    "loans near me",
    "loan agent near me Pune",
    "best loans Pune",
    "best personal loan Pune",
    "best home loan Pune",
    "best business loan Pune",
    "best MSME loan India",
    "loan near Chinchwad",
    "loan service near me",
    "fast loan approval Pune",
    // GEO / local
    "personal loan Chinchwad",
    "home loan Chinchwad",
    "business loan Chinchwad Pimpri",
    "loan agent Wakad Hinjawadi",
    "loan without documents Pune",
    "instant personal loan Pune",
    // Service queries
    "speedy loan finance services",
    "Andromeda DSA Pune",
    "loan DSA agent Pune",
    "zero fee loan consultant",
    "loan advisor Pune",
    "MSME loan consultant Maharashtra",
    "loan against property Pune",
    // Long-tail / conversational (LLMO)
    "how to get personal loan in Pune",
    "which is best loan agent in Pune",
    "loan approval in 24 hours Pune",
    "home loan low interest Pune",
    "business loan for new business Pune",
  ],
  alternates: {
    canonical: "https://speedyloanfinance.com/",
    languages: {
      "en-IN": "https://speedyloanfinance.com/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://speedyloanfinance.com/",
    siteName: "Speedy Loan Finance Services",
    title: "Speedy Loan Finance Services | Best Loan Agent in Pune – Personal, Home, Business & MSME Loans",
    description:
      "Pune's most trusted loan DSA agent. Personal, Home, Business & MSME Loans through 15+ banks & NBFCs. Zero upfront fees. Fast approval. Located near Chinchwad Railway Station.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Speedy Loan Finance Services – Best Loan Agent in Pune near Chinchwad",
        type: "image/png",
      },
    ],
    countryName: "India",
  },
  twitter: {
    card: "summary_large_image",
    site: "@speedyloanfinance",
    title: "Speedy Loan Finance Services | Best Loan Agent Pune – Personal, Home, Business Loans",
    description:
      "Fast loan approval in Pune. Personal, Home, Business & MSME loans. 15+ bank partners. Zero fees. Call 7350005590. Located at Chinchwad.",
    images: [{ url: "/logo.png", alt: "Speedy Loan Finance Services" }],
  },
};

export default function Home() {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/blog", text: "Blog" },
  ];

  // ── 1. WebSite Schema with SearchAction ─────────────────────────────────────
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://speedyloanfinance.com/#website",
    "url": "https://speedyloanfinance.com/",
    "name": "Speedy Loan Finance Services",
    "description": "Pune's most trusted loan DSA consultancy offering Personal, Home, Business, MSME Loans and more with fast approval and zero upfront fees.",
    "inLanguage": "en-IN",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://speedyloanfinance.com/blog/?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // ── 2. BreadcrumbList Schema ─────────────────────────────────────────────────
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home – Speedy Loan Finance Services",
        "item": "https://speedyloanfinance.com/"
      }
    ]
  };

  // ── 3. FAQ Schema – AEO Optimised (10 expert answers) ───────────────────────
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://speedyloanfinance.com/#homepage-faq",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What types of loans does Speedy Loan Finance Services offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Speedy Loan Finance Services offers Personal Loans, Home Loans, Business Loans, MSME/SME Loans, Loan Against Property (LAP), Working Capital Loans (Cash Credit, Overdraft), Balance Transfer, and Insurance & Investment advisory. All loans are processed through 15+ major banks and NBFCs including HDFC, ICICI, SBI, Axis, Kotak, Bajaj Finserv, and Tata Capital."
        }
      },
      {
        "@type": "Question",
        "name": "Which areas in Pune does Speedy Loan Finance serve?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Speedy Loan Finance Services primarily serves customers in Pune, Chinchwad, Pimpri, Wakad, Hinjawadi, Ravet, Sangvi, Bhosari, Kothrud, Baner, Aundh, and surrounding areas in Maharashtra, India."
        }
      },
      {
        "@type": "Question",
        "name": "Does Speedy Loan Finance charge any upfront fees?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Speedy Loan Finance Services does NOT charge any upfront or processing fees. Our consultation and loan guidance is completely free. Any charges are levied directly by the bank or NBFC only after loan approval and disbursal."
        }
      },
      {
        "@type": "Question",
        "name": "Which banks and NBFCs are partners of Speedy Loan Finance Services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We partner with 15+ leading financial institutions including HDFC Bank, ICICI Bank, State Bank of India (SBI), Bank of India, Kotak Mahindra Bank, Axis Bank, Federal Bank, YES Bank, Punjab National Bank (PNB), Bank of Baroda, Tata Capital, Bajaj Finserv, IIFL Finance, UGRO Capital, and RBL Bank through the Andromeda DSA platform."
        }
      },
      {
        "@type": "Question",
        "name": "What is the minimum CIBIL score required for a personal loan in Pune?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A CIBIL score of 750 or above is ideal for personal loan approval with best interest rates. Scores of 700–749 have good approval chances. Scores of 600–699 may still qualify depending on income and employment. Speedy Loan Finance helps customers with all CIBIL profiles find the right lender."
        }
      },
      {
        "@type": "Question",
        "name": "How fast can I get a loan approved through Speedy Loan Finance Services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Personal loans can be approved and disbursed within 24–72 hours for salaried employees with a strong CIBIL score. Business and MSME loans typically take 3–7 working days. Home loans may take 7–15 working days. Speedy Loan Finance fast-tracks applications through its established bank relationships."
        }
      },
      {
        "@type": "Question",
        "name": "Is Speedy Loan Finance Services a registered DSA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Speedy Loan Finance Services is a certified Andromeda DSA (Direct Selling Agent) partner, India's largest loan distribution network. This gives clients access to loan products from 200+ banks and NBFCs with exclusive rates and faster processing."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a loan with low CIBIL score in Pune?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Speedy Loan Finance Services works with lenders who offer loans to applicants with lower CIBIL scores or no credit history, especially if you have stable income, good banking history, or collateral. Some NBFCs offer loans to first-time borrowers based on income and employment stability."
        }
      },
      {
        "@type": "Question",
        "name": "What documents are needed for a personal loan in Pune?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For salaried individuals: Aadhaar Card, PAN Card, last 3 months salary slips, last 3-6 months bank statements, and employee ID. For self-employed: Aadhaar Card, PAN Card, last 2 years ITR, Profit & Loss statement, Balance Sheet, and business bank statements. Speedy Loan Finance guides you through every step."
        }
      },
      {
        "@type": "Question",
        "name": "How do I contact Speedy Loan Finance Services in Pune?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can contact Speedy Loan Finance Services at: Phone: +91 7350005590, Email: loanspeedy@gmail.com, WhatsApp: wa.me/917350005590, or visit our office at Mayur Trade Center, Near Chinchwad Railway Station, Chinchwad, Pune – 411033. Office hours: Monday to Saturday, 9:00 AM to 7:00 PM."
        }
      }
    ]
  };

  // ── 4. Service Catalog Schema ────────────────────────────────────────────────
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://speedyloanfinance.com/#services-list",
    "name": "Loan Services by Speedy Loan Finance Services",
    "description": "Complete list of loan and financial services offered by Speedy Loan Finance Services in Pune",
    "numberOfItems": 8,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Service",
          "name": "Personal Loan in Pune",
          "description": "Fast personal loans with minimal documentation for salaried and self-employed in Pune. CIBIL 700+ preferred. Approval in 24-72 hours.",
          "url": "https://speedyloanfinance.com/blog/blog_1/",
          "provider": { "@id": "https://speedyloanfinance.com/#financial_service" },
          "areaServed": "Pune, Maharashtra",
          "serviceType": "Personal Loan",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR", "description": "Free consultation – No upfront charges" }
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Service",
          "name": "Home Loan in Pune",
          "description": "Competitive home loans for purchase, construction, or renovation through top banks and NBFCs in Pune.",
          "provider": { "@id": "https://speedyloanfinance.com/#financial_service" },
          "areaServed": "Pune, Maharashtra",
          "serviceType": "Home Loan"
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "Service",
          "name": "Business Loan in Pune",
          "description": "Fast business loans for SMEs, startups, and proprietors in Pune. Quick approval with minimal documentation.",
          "url": "https://speedyloanfinance.com/blog/blog_2/",
          "provider": { "@id": "https://speedyloanfinance.com/#financial_service" },
          "areaServed": "Pune, Maharashtra",
          "serviceType": "Business Loan"
        }
      },
      {
        "@type": "ListItem",
        "position": 4,
        "item": {
          "@type": "Service",
          "name": "MSME Loan",
          "description": "Government-backed and commercial MSME loans for micro, small, and medium enterprises through scheduled banks and NBFCs.",
          "provider": { "@id": "https://speedyloanfinance.com/#financial_service" },
          "areaServed": "India",
          "serviceType": "MSME Loan"
        }
      },
      {
        "@type": "ListItem",
        "position": 5,
        "item": {
          "@type": "Service",
          "name": "Loan Against Property (LAP)",
          "description": "High-value loans against residential or commercial property at attractive interest rates.",
          "provider": { "@id": "https://speedyloanfinance.com/#financial_service" },
          "areaServed": "Pune, Maharashtra",
          "serviceType": "Secured Loan"
        }
      },
      {
        "@type": "ListItem",
        "position": 6,
        "item": {
          "@type": "Service",
          "name": "Working Capital Loan",
          "description": "Working capital solutions including Cash Credit, Overdraft, and short-term business loans.",
          "url": "https://speedyloanfinance.com/blog/blog_3/",
          "provider": { "@id": "https://speedyloanfinance.com/#financial_service" },
          "serviceType": "Working Capital"
        }
      },
      {
        "@type": "ListItem",
        "position": 7,
        "item": {
          "@type": "Service",
          "name": "Balance Transfer",
          "description": "Transfer existing high-interest loans to new bank at lower interest rates with reduced EMIs.",
          "provider": { "@id": "https://speedyloanfinance.com/#financial_service" },
          "serviceType": "Loan Refinancing"
        }
      },
      {
        "@type": "ListItem",
        "position": 8,
        "item": {
          "@type": "Service",
          "name": "Insurance & Investment Advisory",
          "description": "Insurance planning and investment advisory for individuals and businesses in Pune.",
          "provider": { "@id": "https://speedyloanfinance.com/#financial_service" },
          "serviceType": "Financial Advisory"
        }
      }
    ]
  };

  // ── 5. HowTo Schema – AEO for "how to apply for loan" queries ───────────────
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": "https://speedyloanfinance.com/#how-to-apply",
    "name": "How to Apply for a Loan Through Speedy Loan Finance Services in Pune",
    "description": "Step-by-step guide to applying for a Personal, Home, Business, or MSME loan through Speedy Loan Finance Services in Pune.",
    "totalTime": "P3D",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": "0",
      "description": "Free – No upfront charges"
    },
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Contact Speedy Loan Finance Services",
        "text": "Call +91 7350005590 or WhatsApp to schedule a free consultation. You can also email loanspeedy@gmail.com or walk in to our office at Mayur Trade Center, Chinchwad, Pune.",
        "url": "https://speedyloanfinance.com/contact/"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Eligibility Assessment",
        "text": "Our loan experts will assess your CIBIL score, income, employment, and financial profile to determine the best loan product and the right lender for you.",
        "url": "https://speedyloanfinance.com/documentation/"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Document Collection",
        "text": "Prepare your KYC documents (Aadhaar, PAN), income proof (salary slips or ITR), bank statements, and any additional documents as guided by our team.",
        "url": "https://speedyloanfinance.com/documentation/"
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Loan Application Submission",
        "text": "We submit your loan application to the most suitable bank or NBFC on your behalf, ensuring all documentation is complete and accurate for fast processing.",
        "url": "https://speedyloanfinance.com/schedules/"
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Loan Approval & Disbursal",
        "text": "After verification by the bank, your loan gets approved and disbursed. Personal loans can be disbursed within 24–72 hours. We guide you through the entire process till the money is in your account.",
        "url": "https://speedyloanfinance.com/contact/"
      }
    ]
  };

  return (
    <main>
      {/* ── Structured Data Scripts ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* ── Page Sections ── */}
      <Hero />
      <ThumbnailCarousel/>

      <HeroSub
        title="Types Of Loans Covered At Speedy Loan Finance."
        description="Explore our wide range of loan solutions including personal, business, home, and MSME loans with fast approval and minimal documentation."
        breadcrumbLinks={breadcrumbLinks}
      />
      <BlogList />
      <WorkSpeakers/>
      <EventTicket/>
      <Highlight/>
      <Upcoming/>
      <Testimonials/>
      <TicketSection/>
    </main>
  )
}
