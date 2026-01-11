import { NextResponse } from "next/server";

type Body = {
  text: string;
  voice?: string; // optional voice id
  model?: string; // optional model identifier
};

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    if (!body?.text) {
      return NextResponse.json({ error: "Missing text in request body" }, { status: 400 });
    }

    const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
    const DEFAULT_VOICE = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

    if (!ELEVEN_KEY) {
      return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 });
    }

    const voiceId = body.voice || DEFAULT_VOICE;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const elevenRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // accept both xi-api-key and Authorization to be compatible
        "xi-api-key": ELEVEN_KEY,
        Authorization: `Bearer ${ELEVEN_KEY}`,
      },
      body: JSON.stringify({ text: body.text, model: body.model || undefined }),
    });

    if (!elevenRes.ok) {
      const text = await elevenRes.text();
      return NextResponse.json({ error: "ElevenLabs error", details: text }, { status: elevenRes.status });
    }

    // Stream audio back to client preserving content-type
    const contentType = elevenRes.headers.get("content-type") || "audio/mpeg";
    return new NextResponse(elevenRes.body, {
      status: 200,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (err: any) {
    console.error("/api/text-to-speech error", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
