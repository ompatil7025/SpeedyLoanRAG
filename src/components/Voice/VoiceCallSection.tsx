"use client";

import React, { useEffect, useState } from "react";

type Language = "en-IN" | "hi-IN" | "mr-IN";

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "en-IN", label: "English" },
  { id: "hi-IN", label: "हिंदी" },
  { id: "mr-IN", label: "मराठी" },
];

type Status = "idle" | "sending" | "dialling" | "error";

const ERROR_TEXT: Record<string, string> = {
  invalid_phone: "Please enter a valid 10-digit Indian mobile number.",
  consent_required: "Please tick the consent box so we are allowed to call you.",
  rate_limited: "Too many requests from this connection. Please try again later or call us directly.",
  voice_not_configured: "The AI calling line is being activated. Please call 73500 05590 in the meantime.",
  call_failed: "We could not place the call just now. Please try again or call 73500 05590.",
  invalid_json: "Something went wrong. Please try again.",
};

const VoiceCallSection: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<Language>("en-IN");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/voice/outbound/")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => {
        if (!cancelled) setConfigured(Boolean(data.configured));
      })
      .catch(() => {
        if (!cancelled) setConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "sending" || status === "dialling") return;

    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/voice/outbound/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, language, consent }),
      });

      const data = (await res.json()) as { error?: string; ok?: boolean };

      if (!res.ok || !data.ok) {
        const key = data.error ?? "call_failed";
        setMessage(ERROR_TEXT[key] ?? ERROR_TEXT.call_failed);
        setStatus("error");
        if (key === "voice_not_configured") setConfigured(false);
        return;
      }

      setStatus("dialling");
      setMessage("Calling you now — please answer in the next 30 seconds. Sneha will greet you in your chosen language.");
    } catch {
      setMessage(ERROR_TEXT.call_failed);
      setStatus("error");
    }
  };

  const busy = status === "sending" || status === "dialling";

  return (
    <section className="relative overflow-hidden bg-secondary py-20 dark:bg-darkmode">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-ElectricAqua/10 blur-3xl" />

      <div className="relative mx-auto max-w-1170 px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* ── Left: pitch ─────────────────────────────────────────── */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80">
              <span className="h-2 w-2 animate-pulse rounded-full bg-Aquamarine" />
              AI Voice Advisor
            </span>

            <h2 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Get a call back from Sneha — in Marathi, Hindi or English
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
              Enter your mobile number and our AI loan advisor calls you within seconds. She
              understands your requirement, explains the loan options, and connects you to a human
              advisor at Speedy Loan Finance Services when needed.
            </p>

            <ul className="mt-7 space-y-3 text-sm text-white/80">
              {[
                "Speaks Marathi, Hindi and English — switches to your language automatically",
                "Covers personal, home, business, MSME, LAP and balance transfer enquiries",
                "Zero upfront fees — the same promise our office gives you",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-Aquamarine"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-xs leading-5 text-white/50">
              Calls are placed only after you tick the consent box. We do not record calls and we do
              not share your number with third parties.
            </p>
          </div>

          {/* ── Right: form ─────────────────────────────────────────── */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm sm:p-9">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="voice-name" className="mb-2 block text-sm font-medium text-white/80">
                  Your name <span className="text-white/40">(optional)</span>
                </label>
                <input
                  id="voice-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={60}
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-Aquamarine/70 focus:ring-2 focus:ring-Aquamarine/30"
                  placeholder="e.g. Rahul"
                />
              </div>

              <div>
                <label htmlFor="voice-phone" className="mb-2 block text-sm font-medium text-white/80">
                  Mobile number
                </label>
                <div className="flex overflow-hidden rounded-xl border border-white/15 bg-white/10 focus-within:border-Aquamarine/70 focus-within:ring-2 focus-within:ring-Aquamarine/30">
                  <span className="flex items-center border-r border-white/15 px-4 text-sm text-white/60">
                    +91
                  </span>
                  <input
                    id="voice-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                    required
                    aria-describedby="voice-phone-help"
                    className="w-full bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none"
                    placeholder="98765 43210"
                  />
                </div>
                <p id="voice-phone-help" className="mt-1.5 text-xs text-white/40">
                  10-digit mobile number, no spaces or +91 needed.
                </p>
              </div>

              <fieldset>
                <legend className="mb-2 block text-sm font-medium text-white/80">
                  Language for the call
                </legend>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Call language">
                  {LANGUAGES.map((option) => {
                    const active = language === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setLanguage(option.id)}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                          active
                            ? "border-Aquamarine bg-Aquamarine/15 text-white"
                            : "border-white/15 bg-white/5 text-white/70 hover:border-white/30"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="flex items-start gap-3 text-xs leading-5 text-white/60">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  required
                  className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-primary focus:ring-Aquamarine"
                />
                <span>
                  I consent to receive an automated call from Speedy Loan Finance Services about my
                  loan enquiry. This is an AI assistant; I can ask for a human advisor at any time.
                </span>
              </label>

              <button
                type="submit"
                disabled={busy || !consent || phone.length !== 10}
                className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-RegalBlue disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Placing your call…" : "Call me now"}
              </button>

              <div aria-live="polite" className="min-h-[1.25rem]">
                {message ? (
                  <p
                    className={`rounded-xl px-4 py-3 text-sm ${
                      status === "error"
                        ? "bg-red-500/15 text-red-200"
                        : "bg-Aquamarine/10 text-Aquamarine"
                    }`}
                  >
                    {message}
                  </p>
                ) : null}
              </div>

              <p className="text-center text-xs text-white/40">
                Prefer to talk now?{" "}
                <a href="tel:+917350005590" className="font-semibold text-white/70 underline">
                  Call 73500 05590
                </a>
              </p>

              {configured === false ? (
                <p className="rounded-xl bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-200">
                  The AI calling line is being activated. Please use the phone number above or
                  WhatsApp us until it goes live.
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoiceCallSection;
