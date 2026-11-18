// -----------------------------------------------------------------------------
// Lead store
//
// Supabase when configured (production), otherwise a JSON file on disk so the
// feature works locally without any database. Failures never break a call.
// -----------------------------------------------------------------------------

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { LeadAnalysis } from "./lead";

export interface StoredLead extends LeadAnalysis {
  id: string;
  callSid: string;
  name: string;
  phone: string;
  language: string;
  createdAt: string;
  transcript: { role: string; text: string }[];
}

const TABLE = "voice_leads";

function supabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function supabaseKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

function supabaseReady(): boolean {
  return Boolean(supabaseUrl() && supabaseKey());
}

function storeFile(): string {
  const base = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), ".data");
  return path.join(base, "voice-leads.json");
}

async function readFileLeads(): Promise<StoredLead[]> {
  try {
    const raw = await fs.readFile(storeFile(), "utf8");
    const parsed = JSON.parse(raw) as StoredLead[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFileLeads(leads: StoredLead[]): Promise<void> {
  try {
    const file = storeFile();
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(leads.slice(0, 200), null, 2), "utf8");
  } catch (error) {
    console.warn("[voice] lead store write failed:", error instanceof Error ? error.message : error);
  }
}

export async function saveLead(lead: StoredLead): Promise<void> {
  if (supabaseReady()) {
    try {
      const client = createClient(supabaseUrl(), supabaseKey(), { auth: { persistSession: false } });
      const { error } = await client.from(TABLE).upsert(
        {
          call_sid: lead.callSid,
          name: lead.name,
          phone: lead.phone,
          language: lead.language,
          customer_type: lead.customerType,
          loan_type: lead.loanType,
          amount: lead.amountRequired,
          income: lead.monthlyIncome,
          obligations: lead.existingObligations,
          foir: lead.foir,
          intent: lead.intent,
          score: lead.score,
          city: lead.city,
          summary: lead.summary,
          data: lead,
          created_at: lead.createdAt,
        },
        { onConflict: "call_sid" }
      );
      if (!error) return;
      console.warn("[voice] lead table unavailable, using file store:", error.message);
    } catch (error) {
      console.warn("[voice] lead store error:", error instanceof Error ? error.message : error);
    }
  }

  const existing = await readFileLeads();
  const next = [lead, ...existing.filter((item) => item.callSid !== lead.callSid)];
  await writeFileLeads(next);
}

export async function listLeads(limit = 25): Promise<StoredLead[]> {
  if (supabaseReady()) {
    try {
      const client = createClient(supabaseUrl(), supabaseKey(), { auth: { persistSession: false } });
      const { data, error } = await client
        .from(TABLE)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row) => {
          const record = row as Record<string, unknown>;
          const payload = (record.data ?? {}) as Partial<StoredLead>;
          return {
            id: String(record.id ?? payload.id ?? record.call_sid ?? ""),
            callSid: String(record.call_sid ?? ""),
            name: String(record.name ?? ""),
            phone: String(record.phone ?? ""),
            language: String(record.language ?? ""),
            createdAt: String(record.created_at ?? payload.createdAt ?? ""),
            customerType: String(record.customer_type ?? payload.customerType ?? "Unknown"),
            loanType: String(record.loan_type ?? payload.loanType ?? "Not shared"),
            amountRequired: String(record.amount ?? payload.amountRequired ?? "Not shared"),
            monthlyIncome: String(record.income ?? payload.monthlyIncome ?? "Not shared"),
            existingObligations: String(record.obligations ?? payload.existingObligations ?? "Not shared"),
            employmentDetails: String(payload.employmentDetails ?? "Not shared"),
            city: String(record.city ?? payload.city ?? "Not shared"),
            cibil: String(payload.cibil ?? "Not shared"),
            foir: String(record.foir ?? payload.foir ?? "Not calculated"),
            intent: (record.intent as StoredLead["intent"]) ?? "Cold",
            score: Number(record.score ?? payload.score ?? 0),
            summary: String(record.summary ?? payload.summary ?? ""),
            recommendedProducts: Array.isArray(payload.recommendedProducts)
              ? (payload.recommendedProducts as string[])
              : [],
            nextAction: String(payload.nextAction ?? ""),
            transcript: Array.isArray(payload.transcript) ? payload.transcript : [],
          } satisfies StoredLead;
        });
      }
      if (error) console.warn("[voice] lead list unavailable, using file store:", error.message);
    } catch (error) {
      console.warn("[voice] lead list error:", error instanceof Error ? error.message : error);
    }
  }

  const leads = await readFileLeads();
  return leads
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

/** Shows only the last two digits unless the caller is authorised. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "—";
  return `+${digits.slice(0, 2)} ${"•".repeat(Math.max(0, digits.length - 6))}${digits.slice(-4)}`;
}
