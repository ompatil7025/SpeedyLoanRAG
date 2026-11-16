// ─────────────────────────────────────────────────────────────────────────────
// Call logging — best effort.
// If Supabase is not configured, or the `voice_calls` table is missing, the
// call itself is never affected: failures are swallowed and logged to console.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

export interface VoiceCallRecord {
  call_sid: string;
  to_number?: string | null;
  from_number?: string | null;
  status?: string | null;
  duration_seconds?: number | null;
  language?: string | null;
  turns?: number | null;
  transcript?: unknown;
  source?: string | null;
}

function serverKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

export async function logVoiceCall(record: VoiceCallRecord): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = serverKey();

  if (!url || !key || !record.call_sid) return;

  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await client
      .from("voice_calls")
      .upsert(record, { onConflict: "call_sid" });
    if (error) {
      console.warn("[voice] call log skipped:", error.message);
    }
  } catch (error) {
    console.warn("[voice] call log failed:", error instanceof Error ? error.message : error);
  }
}
