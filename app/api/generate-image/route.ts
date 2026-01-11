import { NextResponse } from "next/server";

type Body = {
  prompt: string;
  size?: "256x256" | "512x512" | "1024x1024";
  n?: number;
  model?: string;
};

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    if (!body?.prompt) {
      return NextResponse.json({ error: "Missing 'prompt' in request body" }, { status: 400 });
    }

    const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
    const REPLICATE_VERSION = process.env.REPLICATE_MODEL_VERSION; // required for replicate

    // If Replicate is configured, use it
    if (REPLICATE_TOKEN && REPLICATE_VERSION) {
      // Create a prediction
      const createRes = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${REPLICATE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: REPLICATE_VERSION,
          input: { prompt: body.prompt, width: body.size?.split("x")[0] ? Number(body.size.split("x")[0]) : undefined },
        }),
      });

      const created = await createRes.json();
      if (!createRes.ok) {
        return NextResponse.json({ error: "Replicate create failed", details: created }, { status: createRes.status });
      }

      // Poll prediction status
      const predictionId = created.id;
      const maxAttempts = 30;
      let attempt = 0;
      while (attempt < maxAttempts) {
        const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
        });
        const statusData = await statusRes.json();
        if (statusData.status === "succeeded") {
          const output = statusData.output;
          // output may be array of urls
          return NextResponse.json({ url: output?.[0] ?? output, raw: statusData });
        }
        if (statusData.status === "failed") {
          return NextResponse.json({ error: "Replicate generation failed", details: statusData }, { status: 502 });
        }
        attempt++;
        await new Promise((r) => setTimeout(r, 1500));
      }

      return NextResponse.json({ error: "Replicate generation timed out" }, { status: 504 });
    }

    // Fallback to OpenAI Images (if configured)
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_IMAGES_URL = process.env.OPENAI_IMAGES_URL || "https://api.openai.com/v1/images/generations";

    if (!OPENAI_KEY) {
      return NextResponse.json({ error: "No image provider configured. Set REPLICATE_API_TOKEN and REPLICATE_MODEL_VERSION or OPENAI_API_KEY." }, { status: 500 });
    }

    const payload = {
      prompt: body.prompt,
      n: body.n ?? 1,
      size: body.size ?? "512x512",
      model: body.model ?? undefined,
    } as any;

    const res = await fetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: "Image API error", details: data }, { status: res.status });
    }

    // Support both url-based and base64 responses
    const first = data?.data?.[0];
    if (!first) {
      return NextResponse.json({ error: "No image returned", raw: data }, { status: 502 });
    }

    if (first.url) {
      return NextResponse.json({ url: first.url, raw: data });
    }

    if (first.b64_json) {
      const dataUrl = `data:image/png;base64,${first.b64_json}`;
      return NextResponse.json({ dataUrl, raw: data });
    }

    return NextResponse.json({ raw: data });
  } catch (err: any) {
    console.error("/api/generate-image error", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
