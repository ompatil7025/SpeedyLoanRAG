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
| `/api/voice/*` | AI Voice Advisor — outbound calls, TwiML, conversation turns, speech, status callbacks |

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
  lib/voice/                # AI Voice Advisor: config, Twilio client, agent brain, TwiML, state
  components/Voice/         # VoiceCallSection — the call-me-now widget
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
| `NEXT_PUBLIC_GEMINI_API_KEY` | public | yes | Gemini access for `/api/chat` and the voice agent |
| `GEMINI_MODEL` | server | no | Defaults to `gemini-2.5-flash`; `gemini-1.5-flash` is retired |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` | server | for Voice Advisor | Places the outbound call (section 11) |
| `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID` | server | no | Natural Indian female voice for the advisor |

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

## 11. AI Voice Advisor (For Banker's page)

The `/speakers/` page ends with a call-me-now widget: a visitor enters their mobile number, picks a language and gives consent; the site places an outbound call and an AI advisor — "Sneha" — discusses their loan requirement in English, Hindi or Marathi, switching automatically to whichever language the caller is using.

### How it works

```
Browser                Vercel                       Twilio                Caller
   │ POST /api/voice/outbound                         │                     │
   ├───────────────────►│  create Call ──────────────►│  dial +91XXXXXXXXXX►│
   │                    │                             │                     │
   │                    │◄─ fetch TwiML ─────────────┤  "Namaskar, this is  │
   │                    │  /api/voice/twiml          │   Sneha…"           │
   │                    │◄─ recognised speech ───────┤                     │
   │                    │  Gemini + RAG → reply      │                     │
   │                    │  TwiML: Say + Gather ─────►│  speaks, listens ──►│
   │                    │      …until [END_CALL] or [TRANSFER]…            │
   │                    │◄─ status callback ─────────┤                     │
   │                    │  /api/voice/status (logs)  │                     │
```

- **No WebSocket server needed** — every turn is a plain HTTP webhook, so the whole loop runs in serverless functions.
- **State travels with the call** as a base64 token inside the webhook URLs; the conversation works without any database.
- **Language detection is per turn** — Devanagari input is classified as Marathi or Hindi using function-word markers, then the recogniser and the voice both switch.
- **Escalation** — the model can append `[TRANSFER]` (connects the caller to 73500 05590) or `[END_CALL]` (closes the call politely).

### Files

| Path | Purpose |
|---|---|
| `src/components/Voice/VoiceCallSection.tsx` | The widget on the For Banker's page |
| `src/app/api/voice/outbound/route.ts` | Validates number + consent, places the call |
| `src/app/api/voice/twiml/route.ts` | Greeting and silence re-prompt TwiML |
| `src/app/api/voice/turn/route.ts` | One conversation turn (Gemini + RAG) |
| `src/app/api/voice/tts/route.ts` | Signed ElevenLabs audio proxy |
| `src/app/api/voice/status/route.ts` | Twilio status callback → call log |
| `src/lib/voice/*` | Config, Twilio client, agent brain, TwiML builders, state, log store |

### The call flow

1. **Name** — "Namaskar! I am calling from Speedy Loan Finance Services. May I know your first name, please?"
2. **Time-aware greeting + introduction** — "Good evening Rahul ji, I am Sneha calling from Speedy Loan Finance Services. Our office is at Mayur Trade Center, near Chinchwad Railway Station, Pune — you are welcome to verify it anytime. Sir, do you need any type of loan?"
   (morning / afternoon / evening / night is computed in `Asia/Kolkata`, in English, Hindi or Marathi)
3. **Qualification** — one question per turn: loan type → amount → monthly income → salaried or self-employed → city → CIBIL, only if offered.
4. **Lead push to WhatsApp** — once the loan type and amount are known, the agent confirms the requirement, says the details are going to the Speedy Loan team on WhatsApp, and appends `[SEND_LEAD]`. The server then posts a formatted brief to `+91 73500 05590`.
5. **Close** — `[END_CALL]` for a polite hangup, or `[TRANSFER]` to a human advisor on 73500 05590.

### Turning it on

The widget degrades gracefully: until Twilio credentials exist, submissions return `voice_not_configured` and the UI falls back to showing the office phone number.

1. **Twilio** — buy (or port) a `+91` caller ID, then set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` and `TWILIO_PHONE_NUMBER`. Webhook URLs are derived from `NEXT_PUBLIC_SITE_URL`, so nothing needs to be pasted into the Twilio console.
2. **Voice** — for the natural Pune/Mumbai female accent set `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`; `eleven_multilingual_v2` speaks English, Hindi and Marathi in one consistent voice. Without them the agent uses Twilio's built-in `Polly.Aditi`, which is good for English and Hindi but reads Marathi with a Hindi accent.
3. **Call logs (optional)** — run in the Supabase SQL editor:

```sql
create table if not exists public.voice_calls (
  id uuid primary key default gen_random_uuid(),
  call_sid text unique,
  to_number text,
  from_number text,
  status text,
  duration_seconds int,
  language text,
  turns int,
  transcript jsonb,
  source text,
  created_at timestamptz default now()
);
alter table public.voice_calls enable row level security;

-- Allow inserts with the anon key; read via the dashboard or a service-role key.
create policy "voice_calls_insert" on public.voice_calls
  for insert with check (true);
```

3. **WhatsApp lead delivery** — set `TWILIO_WHATSAPP_FROM` (defaults to the Twilio sandbox `whatsapp:+14155238886`) and `VOICE_LEAD_WHATSAPP` (defaults to `+917350005590`). On a trial account the receiving phone must first join the sandbox: from that WhatsApp number send `join <your-sandbox-code>` to +1 415 523 8886. Without it Twilio answers `572002` and the lead is logged but never delivered.

Set `SUPABASE_SERVICE_ROLE_KEY` server-side so transcripts can be upserted as the call progresses.

### Compliance (India)

- The form captures **explicit consent** before dialling and discloses that the caller is an AI assistant.
- Automated outbound calls to Indian numbers fall under TRAI's unsolicited commercial communication rules — only call numbers that requested it (the endpoint enforces this) and keep volumes conservative; do not market to DND-registered numbers.
- Calls are not recorded.

### Testing without a Twilio account

The TwiML and turn endpoints work with no telephony at all:

```powershell
# capabilities
curl.exe -sS http://localhost:3000/api/voice/outbound/

# opening TwiML (greeting + gather)
curl.exe -sS http://localhost:3000/api/voice/twiml/

# one simulated turn: speech in, TwiML with the AI reply out
$tok = node -e "console.log(Buffer.from(JSON.stringify({lang:'mr-IN',turn:0,stage:0,history:[]})).toString('base64url'))"
$body = 'SpeechResult=' + [System.Uri]::EscapeDataString('मला दहा लाखांचे कर्ज हवे आहे')
$f = "$env:TEMP\t.txt"; [IO.File]::WriteAllText($f, $body, [Text.Encoding]::ASCII)
curl.exe -sS -X POST "http://localhost:3000/api/voice/turn/?s=$tok" -H 'Content-Type: application/x-www-form-urlencoded' --data-binary "@$f"
```

## 12. Credits and licence

Design and base template: [Symposium — Next.js Templates](https://nextjs-templates.com/), distributed via [ThemeWagon](https://themewagon.com/themes/symposium-nextjs/), licensed under MIT. Site content, branding, structured data and the RAG assistant are custom to Speedy Loan Finance Services and developed by Om Patil.

---

**Speedy Loan Finance Services**
Office No. P-227, 2nd Floor, Mayur Trade Center, Near Chinchwad Railway Station, Chinchwad, Pune 411019
+91 73500 05590 · loanspeedy@gmail.com · Mon–Sat, 9:00 AM – 7:00 PM
