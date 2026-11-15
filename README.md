# Speedy Loan Finance Services — Website

Production website and AI loan assistant for **Speedy Loan Finance Services**, a loan DSA (Direct Selling Agent) and authorised **Andromeda** partner based in Chinchwad, Pune, Maharashtra.

| | |
|---|---|
| **Live domain** | https://speedyloanfinance.com |
| **Canonical host** | `speedyloanfinance.com` (apex — `www` redirects to apex) |
| **Primary market** | Pune, Chinchwad, Pimpri, Wakad, Hinjawadi |
| **Framework** | Next.js 15 (App Router) + React 19 + TypeScript |
| **Hosting** | Vercel (serverless — required for `/api/chat`) |
| **Registrar / DNS** | GoDaddy (`ns45` / `ns46.domaincontrol.com`) |

---

## 1. What this project is

A marketing and lead-generation site for loan products — personal, home, business, MSME, loan against property (LAP), working capital, balance transfer, education and LRD — with:

- Product, eligibility and documentation pages aimed at local search intent
- A Gemini-powered RAG chatbot (`/api/chat`) that answers loan questions from a curated knowledge base
- WhatsApp and email lead capture, an EMI calculator and a credit-score entry point
- Structured data (Organization, FinancialService, FAQPage, BreadcrumbList, WebSite, Person) for search and AI answer engines
- PWA manifest, `robots.txt`, XML sitemaps and `llms.txt` for crawler guidance

## 2. Routes

| Route | Purpose |
|---|---|
| `/` | Home — hero, product carousel, bank partners, stats, testimonials |
| `/schedules/` | Loan types, amounts, rates and application flow |
| `/documentation/` | Document checklists per loan product |
| `/contact/` | Office location, phone, WhatsApp, enquiry form |
| `/blog/` | Article index |
| `/blog/[slug]/` | Article detail (content from `markdown/Blog/`) |
| `/speakers/` | Bank and NBFC partner directory |
| `/signin/`, `/signup/` | Auth screens |
| `/api/chat/` | Gemini RAG endpoint used by the chatbot widget |

`trailingSlash: true` is enabled, so all public URLs end with `/`. Canonical tags, sitemaps and internal links already follow this rule — keep it that way when adding pages.

## 3. Project structure

```
src/
  app/
    layout.tsx              # metadata, JSON-LD graph, global providers
    page.tsx                # home
    (site)/                 # public pages (blog, contact, documentation, schedules, speakers, auth)
    api/chat/route.ts       # RAG chatbot endpoint
  components/               # Layout, Home sections, Blog, Contact, Auth, Chatbot
  lib/                      # ragKnowledge.ts, ragRetriever.ts, supabase.ts, apiMock.ts
  utils/                    # config, markdown, AOS
markdown/Blog/              # article source files
public/                     # images, logo, robots.txt, sitemaps, llms.txt, manifest.json
next.config.mjs             # redirect/header/asset configuration
```

## 4. Local development

Requires Node.js >= 18.18 (20 LTS recommended).

```bash
npm install
cp .env.example .env.local     # then fill in real values
npm run dev                    # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build locally
npm run lint     # ESLint
```

> The project is **not** a static export. `next.config.mjs` deliberately does not set `output: "export"`, because that would drop the `/api/chat` serverless function.

## 5. Environment variables

| Variable | Scope | Required in production | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | yes | Canonical origin used for metadata and links |
| `NEXT_PUBLIC_SUPABASE_URL` | public | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | yes | Supabase anonymous key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | optional | Supabase publishable key (newer projects) |
| `NEXT_PUBLIC_GEMINI_API_KEY` | public | yes | Gemini access for `/api/chat` |

Set the same set under **Vercel → Project → Settings → Environment Variables** for *Production*, *Preview* and *Development*. A missing Gemini key does not break page rendering, but the chatbot will fail with a 500.

`.env*.local` is git-ignored — never commit real keys.

## 6. Deployment on Vercel

1. **Import the repository** — `github.com/ompatil7025/SpeedyLoanRAG`, framework preset **Next.js**, build command `npm run build`, no output override.
2. **Add the environment variables** from section 5.
3. **Attach the domains** (Project → Settings → Domains):
   - Add `speedyloanfinance.com` → mark it **Primary**.
   - Add `www.speedyloanfinance.com` → Vercel will label it *Redirect to speedyloanfinance.com*.
4. **Wait for the certificate** on both hosts (usually under a minute after DNS resolves).

`netlify.toml` and `public/_headers` are leftovers from an earlier Netlify deployment. They are inactive on Vercel and can be deleted once you no longer deploy to Netlify; production headers are defined in `next.config.mjs`.

> The primary domain **must stay the apex**. Every canonical URL, `metadataBase`, Open Graph URL and JSON-LD `@id` in this codebase points at `https://speedyloanfinance.com`. Making `www` primary produces a host mismatch that splits ranking signals.

## 7. DNS records (GoDaddy)

Both hosts already resolve to Vercel. The current, correct record set is:

| Type | Name | Value | TTL |
|---|---|---|---|
| `A` | `@` | `216.198.79.1` | 1 week |
| `CNAME` | `www` | `dcea7026d0766a86.vercel-dns-017.com` | 1 day |
| `NS` | `@` | `ns45.domaincontrol.com` | 1 hour |
| `NS` | `@` | `ns46.domaincontrol.com` | 1 hour |
| `SOA` | `@` | `ns45.domaincontrol.com` | 1 hour |

Notes:

- The `CNAME` target is **project-specific**. If the Vercel project is ever recreated, Vercel issues a new target and the record must be updated.
- Do **not** add an `AAAA` record unless Vercel asks for one; a stale `AAAA` on an unrelated host is the usual cause of intermittent `404`s.
- The legacy `TXT verified-for-netlify` record is harmless and can be deleted.

## 8. Verifying the domain after deploying

```bash
# Apex must answer 200 from Vercel
curl -sSI https://speedyloanfinance.com/ | head -n 5

# www must 308-redirect to the apex, not the other way round
curl -sSI https://www.speedyloanfinance.com/ | grep -Ei "^(HTTP|location)"

# http must upgrade to https
curl -sSI http://speedyloanfinance.com/ | grep -Ei "^(HTTP|location)"
```

Expected result:

```
https://speedyloanfinance.com/        -> 200
https://www.speedyloanfinance.com/    -> 308, Location: https://speedyloanfinance.com/
http://speedyloanfinance.com/         -> 308, Location: https://speedyloanfinance.com/
```

Also confirm in the rendered page source: one `<link rel="canonical" href="https://speedyloanfinance.com/...">`, `og:url` on the apex, and the JSON-LD `@id` values resolving to the apex.

## 9. Troubleshooting

**Symptom: apex returns `308` to `www`, and `www` returns `404` with `X-Vercel-Error: NOT_FOUND`.**

This means DNS is fine but the `www` host is not attached to the Vercel project (or is attached to a different project with no production deployment). Redirects defined in `next.config.mjs` cannot fix it, because the 404 is produced at Vercel's domain layer before the app is reached. The fix is in **Project → Settings → Domains**: add `www.speedyloanfinance.com` to the same project and set the apex as the primary domain.

**Symptom: security headers missing in production.**

`public/_headers` is a Netlify/Cloudflare convention and is ignored by Vercel. All production headers are declared in `next.config.mjs → headers()`; add new ones there.

**Symptom: chatbot replies with an error in production.**

Check that `NEXT_PUBLIC_GEMINI_API_KEY` exists for the *Production* environment in Vercel, then redeploy — environment changes only apply to new deployments.

## 10. Content maintenance

- **Articles** live in `markdown/Blog/`; routing and metadata are handled in `src/app/(site)/blog/`.
- **Business details** (phone `+91 73500 05590`, email `loanspeedy@gmail.com`, office address, opening hours) appear in `src/app/layout.tsx` (metadata + JSON-LD), the footer, the contact page and the chatbot system prompt in `src/app/api/chat/route.ts`. Update **all** of them together so the site and its structured data stay consistent.
- **SEO assets** — `public/robots.txt`, `public/sitemap.xml`, `public/sitemap-blog.xml`, `public/llms.txt` are static files; update `lastmod` dates when publishing new pages.

## 11. Credits and licence

Design and base template: [Symposium — Next.js Templates](https://nextjs-templates.com/), distributed via [ThemeWagon](https://themewagon.com/themes/symposium-nextjs/), licensed under MIT. Site content, branding, structured data and the RAG assistant are custom to Speedy Loan Finance Services and developed by Om Patil.

---

**Speedy Loan Finance Services**
Office No. P-227, 2nd Floor, Mayur Trade Center, Near Chinchwad Railway Station, Chinchwad, Pune 411019
+91 73500 05590 · loanspeedy@gmail.com · Mon–Sat, 9:00 AM – 7:00 PM
