-- =============================================================================
-- Speedy Loan Finance Services — voice lead storage
-- Run this once in Supabase → SQL Editor → New query → Run
-- =============================================================================

create table if not exists public.voice_leads (
  id uuid primary key default gen_random_uuid(),
  call_sid text unique,
  name text,
  phone text,
  language text,
  customer_type text,
  loan_type text,
  amount text,
  income text,
  obligations text,
  foir text,
  intent text,
  score int,
  city text,
  summary text,
  data jsonb,
  created_at timestamptz default now()
);

create index if not exists voice_leads_created_at_idx
  on public.voice_leads (created_at desc);

-- Row level security on, with NO public policies.
-- The site talks to this table only from the server, using the service_role key,
-- which bypasses RLS. The anon key ships in the browser bundle, so it must never
-- be able to read customer contact details.
alter table public.voice_leads enable row level security;

-- Remove any permissive policies that may exist from earlier attempts.
drop policy if exists "voice_leads_insert" on public.voice_leads;
drop policy if exists "voice_leads_select" on public.voice_leads;
drop policy if exists "insert leads" on public.voice_leads;
drop policy if exists "read leads" on public.voice_leads;
drop policy if exists "update leads" on public.voice_leads;

-- =============================================================================
-- After running this:
--
-- 1. Supabase → Project Settings → API → copy the  service_role  secret key
--    (NOT the anon key — it is a different, longer value).
--
-- 2. Vercel → Settings → Environment Variables → add:
--        SUPABASE_SERVICE_ROLE_KEY = <that key>       (Production)
--
-- 3. Redeploy so the function picks it up.
--
-- Verify with:
--    curl https://speedyloanfinance.com/api/voice/leads/
--    → {"locked":true,"count":N,...}   N should stop resetting to 0
-- =============================================================================
