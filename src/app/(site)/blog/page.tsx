import HeroSub from "@/components/SharedComponent/HeroSub";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const BlogList = dynamic(() => import("@/components/Blog/BlogList"));
const TicketSection = dynamic(() => import("@/components/Home/TicketSection"));
const Gst = dynamic(() => import("@/components/Home/Gst"));

// ─────────────────────────────────────────────────────────────────────────────
// METADATA – Blog Page: LLMO | AEO | E-E-A-T
// Targets: "loan tips", "best loan guide India", "how to get loan in Pune"
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Loan Guide & Financial Insights – Expert Tips on Personal, Home, Business & MSME Loans | Speedy Loan Finance",
  description:
    "Read expert loan guides, eligibility tips, and financial insights from Speedy Loan Finance Services. Learn about Personal Loans, Home Loans, Business Loans, MSME Loans, CIBIL scores, and documentation requirements. Trusted advice from Pune's leading loan DSA agent.",
  keywords: [
    // LLMO content discovery queries
    "loan guide India",
    "personal loan tips Pune",
    "home loan process India",
    "business loan eligibility",
    "MSME loan guide",
    "how to improve CIBIL score",
    "loan documentation required",
    "how to get personal loan fast",
    "working capital loan guide",
    "loan against property guide",
    // Content-specific
    "finance blog Pune",
    "loan tips India",
    "loan eligibility criteria",
    "personal loan advice",
    "home loan process Pune",
    "business financial advisory",
    "financial insights India",
    "Speedy Loan blog",
    "loan approval guide 2026",
    "how to get loan without documents",
  ],
  alternates: {
    canonical: "https://speedyloanfinance.com/blog/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://speedyloanfinance.com/blog/",
    siteName: "Speedy Loan Finance Services",
    title: "Loan Guide & Financial Insights | Expert Loan Tips – Speedy Loan Finance Services",
    description:
      "Expert financial insights and loan eligibility guides from Speedy Loan Finance Services, Pune. Get trusted advice on Personal, Home, Business, and MSME Loans.",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Speedy Loan Finance Services – Loan Knowledge Hub" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@speedyloanfinance",
    title: "Loan Guide & Financial Insights | Speedy Loan Finance Services",
    description:
      "Expert loan tips and financial insights to make borrowing smart and fast. Personal, Home, Business & MSME loan guides.",
    images: ["/logo.png"],
  },
};

const BlogPage = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/blog", text: "Loan Guides" },
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
        "name": "Loan Guides & Financial Insights",
        "item": "https://speedyloanfinance.com/blog/"
      }
    ]
  };

  // ── 2. Blog / Knowledge Hub Schema ──────────────────────────────────────────
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "https://speedyloanfinance.com/blog/#blog",
    "name": "Speedy Loan Finance – Loan Guides & Financial Insights",
    "description": "Expert loan guides, eligibility tips, documentation guides, and financial insights from Speedy Loan Finance Services. Authoritative content on Personal, Home, Business, and MSME Loans.",
    "url": "https://speedyloanfinance.com/blog/",
    "inLanguage": "en-IN",
    "publisher": {
      "@id": "https://speedyloanfinance.com/#organization"
    },
    "author": {
      "@id": "https://speedyloanfinance.com/#founder"
    },
    "about": [
      { "@type": "Thing", "name": "Personal Loans" },
      { "@type": "Thing", "name": "Home Loans" },
      { "@type": "Thing", "name": "Business Loans" },
      { "@type": "Thing", "name": "MSME Loans" },
      { "@type": "Thing", "name": "CIBIL Score" },
      { "@type": "Thing", "name": "Loan Eligibility" },
      { "@type": "Thing", "name": "Loan Documentation" },
      { "@type": "Thing", "name": "Working Capital Loans" },
      { "@type": "Thing", "name": "Loan Against Property" }
    ],
    "blogPost": [
      {
        "@type": "BlogPosting",
        "@id": "https://speedyloanfinance.com/blog/blog_1/#blogpost",
        "headline": "Personal Loan – Eligibility, Documents & Approval Process Explained",
        "url": "https://speedyloanfinance.com/blog/blog_1/",
        "datePublished": "2026-06-01",
        "dateModified": "2026-06-27",
        "author": { "@id": "https://speedyloanfinance.com/#founder" },
        "image": "https://speedyloanfinance.com/images/blog/blog_1.png"
      },
      {
        "@type": "BlogPosting",
        "@id": "https://speedyloanfinance.com/blog/blog_2/#blogpost",
        "headline": "Business Loan – Fuel Your Growth with Fast & Flexible Funding",
        "url": "https://speedyloanfinance.com/blog/blog_2/",
        "datePublished": "2026-01-08",
        "dateModified": "2026-06-27",
        "author": { "@id": "https://speedyloanfinance.com/#founder" },
        "image": "https://speedyloanfinance.com/images/blog/blog_2.jpg"
      },
      {
        "@type": "BlogPosting",
        "@id": "https://speedyloanfinance.com/blog/blog_3/#blogpost",
        "headline": "Working Capital Loan – Keep Your Business Running Smoothly",
        "url": "https://speedyloanfinance.com/blog/blog_3/",
        "datePublished": "2026-01-04",
        "dateModified": "2026-06-27",
        "author": { "@id": "https://speedyloanfinance.com/#founder" }
      }
    ]
  };

  // ── 3. CollectionPage for SEO ────────────────────────────────────────────────
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://speedyloanfinance.com/blog/#page",
    "url": "https://speedyloanfinance.com/blog/",
    "name": "Loan Guides & Financial Knowledge Hub – Speedy Loan Finance Services",
    "description": "Complete collection of expert loan articles, eligibility guides, and financial insights for Personal, Home, Business, MSME loans by Speedy Loan Finance Services, Pune.",
    "isPartOf": { "@id": "https://speedyloanfinance.com/#website" },
    "about": { "@type": "Thing", "name": "Loan Finance & Banking in India" },
    "inLanguage": "en-IN"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <HeroSub
        title="Loan Guides & Financial Insights"
        description="Expert guides on Personal Loans, Home Loans, Business Loans, MSME Loans, CIBIL scores, and documentation requirements. Trusted advice from Pune's leading loan DSA agent."
        breadcrumbLinks={breadcrumbLinks}
      />
      <BlogList />
      <Gst/>
      <TicketSection/>
    </>
  );
};

export default BlogPage;