import ContactForm from "@/components/Contact/Form";
import ContactInfo from "@/components/Contact/ContactInfo";
import Location from "@/components/Contact/OfficeLocation";
import React from "react";
import HeroSub from "@/components/SharedComponent/HeroSub";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const TicketSection = dynamic(() => import("@/components/Home/TicketSection"));

// ─────────────────────────────────────────────────────────────────────────────
// METADATA – Contact Page: GEO | AEO | E-E-A-T
// Targets: "loan agent near me", "loan office Chinchwad", "contact loan agent Pune"
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Contact Us – Loan Agent Near You in Chinchwad Pune | Speedy Loan Finance Services",
  description:
    "Contact Speedy Loan Finance Services at Mayur Trade Center, Near Chinchwad Railway Station, Pune – 411033. Call +91 73500 05590 or email loanspeedy@gmail.com for instant loan enquiries. Free consultation, zero upfront fees.",
  keywords: [
    "contact speedy loan finance",
    "loan agent near me Pune",
    "loan office near Chinchwad railway station",
    "loan agent contact Pune",
    "Chinchwad loan office",
    "Mayur Trade Center loan",
    "loan enquiry Pune",
    "speedy loan phone number",
    "loanspeedy@gmail.com",
    "loan advisor near me",
    "loan consultant Chinchwad",
    "free loan consultation Pune",
    "loan helpline Pune",
    "best loan agent near Chinchwad",
  ],
  alternates: {
    canonical: "https://speedyloanfinance.com/contact/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Speedy Loan Finance Services",
    title: "Contact Speedy Loan Finance Services | Loan Agent in Chinchwad, Pune",
    description:
      "Visit or call Speedy Loan Finance Services. Mayur Trade Center, Near Chinchwad Railway Station, Pune 411033. Phone: +91 7350005590. Free consultation on all loan types.",
    url: "https://speedyloanfinance.com/contact/",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Contact Speedy Loan Finance Services – Chinchwad Pune" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Speedy Loan Finance Services | Loan Agent Chinchwad Pune",
    description: "Free loan consultation at Chinchwad, Pune. Call +91 7350005590 or WhatsApp. Mon–Sat 9 AM–7 PM.",
    images: ["/logo.png"],
  },
};


const page = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/contact", text: "Contact" },
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
        "name": "Contact Speedy Loan Finance Services",
        "item": "https://speedyloanfinance.com/contact/"
      }
    ]
  };

  // ── 2. ContactPage Schema ────────────────────────────────────────────────────
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": "https://speedyloanfinance.com/contact/#webpage",
    "url": "https://speedyloanfinance.com/contact/",
    "name": "Contact Speedy Loan Finance Services – Loan Agent in Chinchwad, Pune",
    "description": "Get in touch with Speedy Loan Finance Services in Chinchwad, Pune for free consultation on Personal Loans, Home Loans, Business Loans, MSME Loans, and more.",
    "inLanguage": "en-IN",
    "isPartOf": {
      "@id": "https://speedyloanfinance.com/#website"
    },
    "mainEntity": {
      "@id": "https://speedyloanfinance.com/#financial_service"
    },
    "breadcrumb": {
      "@id": "https://speedyloanfinance.com/contact/#breadcrumb"
    }
  };

  // ── 3. LocalBusiness – GEO Optimised NAP Schema ──────────────────────────────
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["FinancialService", "LocalBusiness"],
    "@id": "https://speedyloanfinance.com/#local_business",
    "name": "Speedy Loan Finance Services",
    "alternateName": "Speedy Loan Finance",
    "description": "Speedy Loan Finance Services is a trusted loan DSA consultancy located near Chinchwad Railway Station, Pune. We offer Personal Loans, Home Loans, Business Loans, MSME Loans, Loan Against Property, and Working Capital Loans with zero upfront fees through 15+ major banks and NBFCs.",
    "url": "https://speedyloanfinance.com",
    "logo": "https://speedyloanfinance.com/logo.png",
    "image": "https://speedyloanfinance.com/logo.png",
    "telephone": "+917350005590",
    "email": "loanspeedy@gmail.com",
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
    "hasMap": "https://maps.google.com/?q=18.6526,73.7968",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "10:00",
        "closes": "14:00"
      }
    ],
    "openingHours": ["Mo-Sa 09:00-19:00", "Su 10:00-14:00"],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+917350005590",
        "contactType": "customer service",
        "contactOption": "TollFree",
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
      },
      {
        "@type": "ContactPoint",
        "telephone": "+917350005590",
        "contactType": "WhatsApp",
        "url": "https://wa.me/917350005590"
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
    "areaServed": [
      "Pune", "Chinchwad", "Pimpri", "Wakad", "Hinjawadi",
      "Ravet", "Sangvi", "Bhosari", "Kothrud", "Baner", "Aundh",
      "Shivajinagar", "Hadapsar", "Viman Nagar", "Kharadi"
    ],
    "priceRange": "Free Consultation",
    "currenciesAccepted": "INR",
    "paymentAccepted": ["Bank Transfer", "NEFT", "RTGS", "UPI"],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "127"
    },
    "founder": {
      "@id": "https://speedyloanfinance.com/#founder"
    },
    "sameAs": [
      "https://www.instagram.com/speedyloanfinance/",
      "https://wa.me/917350005590"
    ]
  };

  // ── 4. FAQ (Contact-Specific) ────────────────────────────────────────────────
  const contactFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://speedyloanfinance.com/contact/#faq",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Where is Speedy Loan Finance Services office located?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Speedy Loan Finance Services is located at Mayur Trade Center, Near Chinchwad Railway Station, Chinchwad, Pune, Maharashtra – 411033. Easily accessible by road, bus, and railway."
        }
      },
      {
        "@type": "Question",
        "name": "What are the office hours of Speedy Loan Finance Services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We are open Monday to Saturday from 9:00 AM to 7:00 PM. On Sundays, we are available from 10:00 AM to 2:00 PM. You can also reach us via phone, email, or WhatsApp at any time."
        }
      },
      {
        "@type": "Question",
        "name": "How can I contact Speedy Loan Finance Services for a loan enquiry?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can contact us through multiple channels: Phone: +91 7350005590, Email: loanspeedy@gmail.com, WhatsApp: wa.me/917350005590, or visit our office at Mayur Trade Center, Chinchwad, Pune. We offer free consultation with no upfront charges."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to visit the office or can I apply online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can start the loan process via phone or WhatsApp without visiting the office. However, for complex cases like home loans or large business loans, an in-person meeting at our Chinchwad office may be recommended for personalized guidance."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactFaqSchema) }}
      />
      <HeroSub
        title="Contact Us"
        description="Get in touch with Speedy Loan Finance Services for a free consultation. Visit us at Mayur Trade Center, Chinchwad, Pune or call +91 7350005590. We're available Monday to Saturday, 9 AM to 7 PM."
        breadcrumbLinks={breadcrumbLinks}
      />
      <ContactInfo />
      <ContactForm />
      <Location />
      <TicketSection/>
    </>
  );
};

export default page;
