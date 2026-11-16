// ─────────────────────────────────────────────────────────────────────────────
// /api/voice/tts
// Streams generated speech for a signed line of text.
// Used only when ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID are configured.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { premiumVoiceConfigured, voiceConfig } from "@/lib/voice/config";
import { verifySpeechToken } from "@/lib/voice/tts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!premiumVoiceConfigured()) {
    return new NextResponse("Voice synthesis not configured", { status: 503 });
  }

  const token = new URL(req.url).searchParams.get("p") ?? "";
  const verified = verifySpeechToken(token);
  if (!verified) {
    return new NextResponse("Invalid token", { status: 401 });
  }

  const endpoint =
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceConfig.elevenLabs.voiceId)}` +
    `?output_format=mp3_44100_128`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "xi-api-key": voiceConfig.elevenLabs.apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      cache: "no-store",
      body: JSON.stringify({
        text: verified.text,
        model_id: voiceConfig.elevenLabs.modelId,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          style: 0.25,
          use_speaker_boost: true,
        },
      }),
    });

    if (!res.ok || !res.body) {
      console.error("[voice] elevenlabs error:", res.status);
      return new NextResponse("Speech synthesis failed", { status: 502 });
    }

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    console.error("[voice] tts failed:", error instanceof Error ? error.message : error);
    return new NextResponse("Speech synthesis failed", { status: 502 });
  }
}
