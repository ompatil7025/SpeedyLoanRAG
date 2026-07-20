// import Newsletter from "@/components/Blog/Newsletter";
// import PopularArticle from "@/components/Blog/PopularArticle";
// import SingleBlog from "@/components/Blog/SingleBlog";
import { getAllPosts, getPostBySlug, getPostSlugs } from "@/utils/markdown";
import markdownToHtml from "@/utils/markdownToHtml";
import dynamic from "next/dynamic";

const TicketSection = dynamic(() => import("@/components/Home/TicketSection"));
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

type Props = {
    params: { slug: string };
};

// ─────────────────────────────────────────────────────────────────────────────
// METADATA – Blog Post: LLMO | AEO | E-E-A-T
// Dynamic per-post metadata with full structured data
// ─────────────────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: any) {
    const data = await params;
    const post = getPostBySlug(data.slug, [
        "title",
        "author",
        "excerpt",
        "coverImage",
        "content",
        "metadata",
        "date",
    ]);

    const siteName = "Speedy Loan Finance Services";
    const siteUrl = "https://speedyloanfinance.com";

    if (post) {
        const description =
            post.excerpt ||
            `Expert guide: ${post.title} – Loan tips, eligibility criteria, and documentation requirements from Speedy Loan Finance Services, Pune's trusted loan DSA agent.`;

        const postUrl = `${siteUrl}/blog/${data.slug}/`;

        return {
            title: `${post.title || "Loan Guide"} | ${siteName} – Expert Advice`,
            description,
            authors: [
                { name: post.author || "Shashikant Shelke", url: siteUrl },
                { name: siteName, url: siteUrl }
            ],
            keywords: [
                post.title?.toLowerCase() || "",
                "loan guide India",
                "loan tips Pune",
                "speedy loan finance blog",
                "personal loan advice India",
                "loan eligibility criteria",
                "loan documentation India",
            ].filter(Boolean),
            alternates: {
                canonical: postUrl,
            },
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    "max-video-preview": -1,
                    "max-image-preview": "large",
                    "max-snippet": -1,
                },
            },
            openGraph: {
                type: "article",
                locale: "en_IN",
                title: `${post.title} | ${siteName}`,
                description,
                url: postUrl,
                siteName,
                publishedTime: post.date || "2026-06-01",
                modifiedTime: "2026-06-27",
                authors: [post.author || "Shashikant Shelke"],
                section: "Loan Finance",
                tags: ["Loan", "Finance", "Pune", "Personal Loan", "Home Loan", "Business Loan"],
                images: post.coverImage
                    ? [{ url: post.coverImage, width: 1200, height: 630, alt: `${post.title} – Speedy Loan Finance` }]
                    : [{ url: "/logo.png", width: 1200, height: 630, alt: siteName }],
            },
            twitter: {
                card: "summary_large_image",
                site: "@speedyloanfinance",
                creator: "@speedyloanfinance",
                title: `${post.title} | ${siteName}`,
                description,
                images: post.coverImage ? [post.coverImage] : ["/logo.png"],
            },
            other: {
                "article:published_time": post.date || "2026-06-01",
                "article:modified_time": "2026-06-27",
                "article:author": post.author || "Shashikant Shelke",
                "article:section": "Loan Finance",
                "article:tag": "Personal Loan, Home Loan, Business Loan, MSME Loan, Pune",
            }
        };
    } else {
        return {
            title: `Article Not Found | ${siteName}`,
            description: "The loan guide you are looking for could not be found. Browse our complete loan knowledge hub.",
            robots: { index: false, follow: true },
        };
    }
}


export default async function Post({ params }: any) {
    const data = await params;
    const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);
    const post = getPostBySlug(data.slug, [
        "title",
        "author",
        "authorImage",
        "excerpt",
        "content",
        "coverImage",
        "date",
    ]);

    const content = await markdownToHtml(post.content || "");

    const siteUrl = "https://speedyloanfinance.com";
    const postUrl = `${siteUrl}/blog/${data.slug}/`;

    // ── 1. BlogPosting Schema (LLMO / E-E-A-T) ──────────────────────────────────
    const blogPostingSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${postUrl}#blogpost`,
      "isPartOf": {
        "@type": "Blog",
        "@id": "https://speedyloanfinance.com/blog/#blog"
      },
      "headline": post.title,
      "name": post.title,
      "description": post.excerpt || `Expert guide: ${post.title} – Loan tips, eligibility, and documentation from Speedy Loan Finance Services.`,
      "image": {
        "@type": "ImageObject",
        "url": post.coverImage ? (post.coverImage.startsWith("http") ? post.coverImage : `${siteUrl}${post.coverImage}`) : `${siteUrl}/logo.png`,
        "width": 1200,
        "height": 630
      },
      "url": postUrl,
      "datePublished": post.date || "2026-06-01",
      "dateModified": "2026-06-27",
      "author": {
        "@type": "Person",
        "@id": "https://speedyloanfinance.com/#founder",
        "name": post.author || "Shashikant Shelke",
        "jobTitle": "Loan Consultant & DSA Partner",
        "image": post.authorImage ? (post.authorImage.startsWith("http") ? post.authorImage : `${siteUrl}${post.authorImage}`) : undefined,
        "url": siteUrl,
        "knowsAbout": ["Personal Loans", "Home Loans", "Business Loans", "MSME Loans", "CIBIL Score", "Loan Eligibility"]
      },
      "publisher": {
        "@type": "Organization",
        "@id": "https://speedyloanfinance.com/#organization",
        "name": "Speedy Loan Finance Services",
        "logo": {
          "@type": "ImageObject",
          "url": "https://speedyloanfinance.com/logo.png",
          "width": 512,
          "height": 512
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": postUrl
      },
      "inLanguage": "en-IN",
      "articleSection": "Loan Finance",
      "keywords": [
        post.title, "loan guide", "finance tips", "Pune loans",
        "Speedy Loan Finance Services", "loan eligibility", "loan documentation"
      ],
      "about": [
        { "@type": "Thing", "name": "Loan Finance" },
        { "@type": "Thing", "name": "Banking & Financial Services" },
        { "@type": "Thing", "name": "Personal Finance India" }
      ],
      "mentions": [
        {
          "@type": "Organization",
          "@id": "https://speedyloanfinance.com/#organization"
        }
      ]
    };

    // ── 2. BreadcrumbList ────────────────────────────────────────────────────────
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${postUrl}#breadcrumb`,
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
          "name": "Loan Guides",
          "item": "https://speedyloanfinance.com/blog/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title,
          "item": postUrl
        }
      ]
    };

    // ── 3. WebPage Schema ────────────────────────────────────────────────────────
    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${postUrl}#webpage`,
      "url": postUrl,
      "name": `${post.title} | Speedy Loan Finance Services`,
      "description": post.excerpt || `Expert loan guide by Speedy Loan Finance Services.`,
      "isPartOf": { "@id": "https://speedyloanfinance.com/#website" },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": post.coverImage ? (post.coverImage.startsWith("http") ? post.coverImage : `${siteUrl}${post.coverImage}`) : `${siteUrl}/logo.png`
      },
      "datePublished": post.date || "2026-06-01",
      "dateModified": "2026-06-27",
      "author": { "@id": "https://speedyloanfinance.com/#founder" },
      "breadcrumb": { "@id": `${postUrl}#breadcrumb` },
      "inLanguage": "en-IN"
    };

    return (
        <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
            />
            <section className=" relative pt-44">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-12 grid-cols-1 items-center">
                        <div className="col-span-12">
                            <div className="flex flex-col sm:flex-row">
                                <span className="text-base text-midnight_text font-medium dark:text-white pr-7 border-r border-solid border-gray dark:border-white w-fit">
                                    {post.date && format(new Date(post.date), "dd MMM yyyy")}
                                </span>
                                <span className="text-base text-midnight_text font-medium dark:text-white sm:pl-7 pl-0 w-fit">
                                    13 Comments
                                </span>
                            </div>
                            <h2 className="text-midnight_text dark:text-white pt-7">
                                {post.title}
                            </h2>
                        </div>
                    </div>
                </div>
            </section>

            <section className="dark:bg-darkmode py-0">
                <div className="container mx-auto">
                    <div className=" flex flex-wrap justify-center">
                        <div className="w-full px-4">
                            <div className="z-20 mb-16 overflow-hidden rounded">
                                <Image
                                    src={post.coverImage}
                                    alt={`${post.title} – Speedy Loan Finance Services`}
                                    width={1170}
                                    height={766}
                                    quality={100}
                                    className="h-full w-full object-cover object-center rounded-3xl"
                                />
                            </div>

                            <div className="-mx-4 flex flex-wrap">
                                <div className="w-full px-4 lg:w-8/12">
                                    <div className="blog-details xl:pr-10">
                                        <div dangerouslySetInnerHTML={{ __html: content }}></div>
                                    </div>
                                </div>

                                <div className="w-full px-4 lg:w-4/12">
                                    <div>
                                        <div className=" mb-8 flex flex-col">
                                            <div className="w-full py-12 px-11 bg-white dark:bg-darklight shadow-lg border-b-2 border-border dark:border-dark_border rounded-t-lg">
                                                <h2
                                                    className="wow fadeInUp relative mb-5 text-2xl dark:text-white text-black  sm:text-[28px] leading-[1.2]"
                                                    data-wow-delay=".1s"
                                                >
                                                    Share
                                                </h2>

                                                <div className="flex gap-4 flex-col">

                                                    <div className="bg-[#526fa3] py-4 px-6 text-xl rounded-lg text-white">
                                                        <Link href="#" className="flex items-center ">
                                                            Facebook
                                                        </Link>
                                                    </div>

                                                    <div className="bg-[#46C4FF] py-4 px-6 text-xl rounded-lg text-white">
                                                        <Link href="#" className="flex items-center ">
                                                            twitter
                                                        </Link>
                                                    </div>

                                                    <div className="bg-[#3C86AD] py-4 px-6 text-xl rounded-lg text-white">
                                                        <Link href="#" className="flex items-center ">
                                                            linkedin
                                                        </Link>
                                                    </div>

                                                </div>
                                            </div>

                                            <div className="w-full py-12 px-11 bg-white dark:bg-darklight shadow-lg rounded-b-lg">
                                                <p className="text-2xl mb-4">Join our Newsletter</p>

                                                <input
                                                    placeholder="Email address "
                                                    className="p-3 dark:bg-semidark border border-border dark:border-dark_border rounded-lg mb-2 w-full focus:outline-0 focus:border-primary dark:focus:border-primary"
                                                />

                                                <button className="w-full py-4 px-9 text-lg font-medium bg-primary hover:bg-blue-700 rounded-lg text-white">
                                                    Subscribe
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </section>

            <TicketSection />
        </>
    );
}

export async function generateStaticParams() {
    const slugs = getPostSlugs().map((s) => s.replace(/\.mdx$/, ""));
    return slugs.map((slug) => ({ slug }));
}