"use client";

import React, { useEffect, useState } from "react";
import LeadsPanel from "./LeadsPanel";

type Language = "en-IN" | "hi-IN" | "mr-IN";

const LANGUAGES: { id: Language; label: string; sub: string }[] = [
  { id: "en-IN", label: "English", sub: "English" },
  { id: "hi-IN", label: "हिंदी", sub: "Hindi" },
  { id: "mr-IN", label: "मराठी", sub: "Marathi" },
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
      setMessage(
        "Calling you now — please answer in the next 30 seconds. Sneha will greet you in your chosen language."
      );
    } catch {
      setMessage(ERROR_TEXT.call_failed);
      setStatus("error");
    }
  };

  const busy = status === "sending" || status === "dialling";

  return (
    <section id="ai-voice-advisor" className="bg-IcyBreeze py-14 dark:bg-darklight md:py-20">
      <div className="container">
        <div className="overflow-hidden rounded-2xl border border-LightSkyBlue bg-white shadow-darkmd dark:border-dark_border dark:bg-darkmode md:rounded-22">
          <div className="grid gap-8 p-6 sm:p-8 md:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:p-12">
            {/* ── Left: pitch ─────────────────────────────────────── */}
            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                AI Voice Advisor
              </span>

              <h2 className="mt-4 text-2xl font-bold leading-snug text-secondary dark:text-white sm:text-3xl md:text-[2rem]">
                Get a call back from Sneha — in Marathi, Hindi or English
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-SlateBlueText dark:text-darktext sm:text-base">
                Enter your mobile number and our AI loan advisor calls you within seconds. She
                understands your requirement, explains the loan options, and connects you to a human
                advisor at Speedy Loan Finance Services when needed.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Speaks Marathi, Hindi and English — switches to your language automatically",
                  "Covers personal, home, business, MSME, LAP and balance transfer enquiries",
                  "Zero upfront fees — the same promise our office gives you",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-MidnightNavyText dark:text-white/80">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
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
                    <span className="leading-6">{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 max-w-xl text-xs leading-5 text-SlateBlueText/90 dark:text-darktext">
                Calls are placed only after you tick the consent box. We do not record calls and we
                do not share your number with third parties.
              </p>
            </div>

            {/* ── Right: form ─────────────────────────────────────── */}
            <div className="rounded-xl border border-LightSkyBlue/70 bg-IcyBreeze/60 p-5 dark:border-dark_border dark:bg-white/5 sm:p-6 md:rounded-2xl">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="voice-name"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary dark:text-white/80"
                  >
                    Your name <span className="font-normal text-SlateBlueText">(optional)</span>
                  </label>
                  <input
                    id="voice-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={60}
                    autoComplete="name"
                    className="w-full rounded-lg border border-LightSkyBlue bg-white px-3.5 py-2.5 text-sm text-secondary placeholder-SlateBlueText/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark_border dark:bg-darklight dark:text-white"
                    placeholder="e.g. Rahul"
                  />
                </div>

                <div>
                  <label
                    htmlFor="voice-phone"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary dark:text-white/80"
                  >
                    Mobile number
                  </label>
                  <div className="flex overflow-hidden rounded-lg border border-LightSkyBlue bg-white transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-dark_border dark:bg-darklight">
                    <span className="flex select-none items-center border-r border-LightSkyBlue px-3.5 text-sm font-medium text-SlateBlueText dark:border-dark_border dark:text-darktext">
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
                      className="w-full bg-transparent px-3.5 py-2.5 text-sm text-secondary placeholder-SlateBlueText/60 outline-none dark:text-white"
                      placeholder="98765 43210"
                    />
                  </div>
                  <p id="voice-phone-help" className="mt-1.5 text-[11px] text-SlateBlueText dark:text-darktext">
                    10-digit mobile number, no spaces or +91 needed.
                  </p>
                </div>

                <fieldset>
                  <legend className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary dark:text-white/80">
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
                          className={`rounded-lg border px-2 py-2 text-center text-xs font-semibold transition ${
                            active
                              ? "border-primary bg-primary text-white shadow-sm"
                              : "border-LightSkyBlue bg-white text-SlateBlueText hover:border-primary/60 hover:text-primary dark:border-dark_border dark:bg-darklight dark:text-darktext"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <label className="flex items-start gap-2.5 rounded-lg bg-white/70 p-3 text-[11px] leading-5 text-SlateBlueText dark:bg-white/5 dark:text-darktext">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-LightSkyBlue text-primary focus:ring-primary/30"
                  />
                  <span>
                    I consent to receive an automated call from Speedy Loan Finance Services about my
                    loan enquiry. This is an AI assistant; I can ask for a human advisor at any time.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={busy || !consent || phone.length !== 10}
                  className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-RegalBlue disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Placing your call…" : "Call me now"}
                </button>

                <div aria-live="polite">
                  {message ? (
                    <p
                      className={`rounded-lg border px-3.5 py-2.5 text-xs leading-5 ${
                        status === "error"
                          ? "border-red-200 bg-red-50 text-red-600"
                          : "border-Aquamarine/40 bg-Aquamarine/10 text-secondary dark:text-white"
                      }`}
                    >
                      {message}
                    </p>
                  ) : null}
                </div>

                <p className="text-center text-[11px] text-SlateBlueText dark:text-darktext">
                  Prefer to talk now?{" "}
                  <a href="tel:+917350005590" className="font-semibold text-primary underline">
                    Call 73500 05590
                  </a>
                </p>

                {configured === false ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11px] leading-5 text-amber-700">
                    The AI calling line is being activated. Please use the phone number above or
                    WhatsApp us until it goes live.
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </div>

        <LeadsPanel />
      </div>
    </section>
  );
};

export default VoiceCallSection;
