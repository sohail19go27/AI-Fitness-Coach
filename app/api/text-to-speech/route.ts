import { NextResponse } from "next/server";

// CRITICAL: Must use Node.js runtime (not Edge) because:
// 1. ElevenLabs streams binary audio data that needs full Node.js Buffer support
// 2. Edge runtime has limited streaming capabilities for large binary responses
// 3. Audio MP3 files can be several MB and require proper buffering
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { text, voice } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
    }

    const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
    if (!ELEVEN_KEY) {
      console.error("ELEVENLABS_API_KEY not found in environment");
      return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 });
    }

    // Use provided voice ID or fall back to default (Rachel voice)
    const voiceId = voice || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

    console.log(`[TTS] Generating audio for text (${text.length} chars) with voice ${voiceId}`);

    // Call ElevenLabs text-to-speech API
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVEN_KEY,
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error(`[TTS] ElevenLabs API error (${elevenLabsResponse.status}):`, errorText);
      return NextResponse.json(
        { error: `ElevenLabs API error: ${errorText}` },
        { status: elevenLabsResponse.status }
      );
    }

    // CRITICAL: Convert stream to buffer for reliable audio playback
    // Why buffer instead of streaming:
    // 1. Ensures complete audio file is available before browser starts playback
    // 2. Allows setting Content-Length header for proper browser buffering
    // 3. Prevents choppy playback from network issues
    // 4. Works reliably across all browsers
    const audioBuffer = await elevenLabsResponse.arrayBuffer();
    
    console.log(`[TTS] Successfully generated audio (${audioBuffer.byteLength} bytes)`);

    // Return audio with proper headers for browser playback
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error: any) {
    console.error("[TTS] Unexpected error:", error);
    return NextResponse.json(
      { error: `Text-to-speech failed: ${error.message}` },
      { status: 500 }
    );
  }
}
