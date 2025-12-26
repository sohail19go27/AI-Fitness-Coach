/**
 * Small OpenAI client wrapper for server-side usage.
 *
 * Usage (server-side / API route):
 *   const res = await callOpenAIWithPrompt(prompt, { model: 'gpt-4o-mini' });
 */

type CallOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  retries?: number;
};

const OPENAI_URL = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Gemini (Google) settings
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5";

async function fetchWithRetry(url: string, init: RequestInit, retries = 1): Promise<Response> {
  try {
    const res = await fetch(url, init);
    if (!res.ok && retries > 0) {
      await new Promise((r) => setTimeout(r, 500));
      return fetchWithRetry(url, init, retries - 1);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 500));
      return fetchWithRetry(url, init, retries - 1);
    }
    throw err;
  }
}

/**
 * Call Gemini (Google) generative text API if GEMINI_API_KEY is present.
 * Falls back to OpenAI-compatible endpoint when GEMINI is not configured.
 */
export async function callLLMWithPrompt(prompt: string, options?: CallOptions) {
  // Prefer Gemini when configured
  if (GEMINI_KEY) {
    // Use the Google Generative Language API text generation endpoint
    // Endpoint: https://generativelanguage.googleapis.com/v1/models/{model}:generateText?key={API_KEY}
    const model = options?.model || GEMINI_MODEL;
    const url = `${process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1"}/models/${model}:generateText?key=${GEMINI_KEY}`;

    const body = {
      prompt: {
        text: prompt,
      },
      temperature: options?.temperature ?? 0.2,
      maxOutputTokens: options?.maxTokens ?? 1024,
    } as any;

    const res = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }, options?.retries ?? 1);

    const data = await res.json();
    if (!res.ok) {
      const msg = data?.error?.message || `Gemini request failed with status ${res.status}`;
      throw new Error(msg);
    }

    // Google GenAI: output may be in data.candidates[0].output or in `candidates[0].content` depending on API
    const text = (data?.candidates && data.candidates[0]?.output) || (data?.candidates && data.candidates[0]?.content) || data?.output;
    return { raw: data, text } as { raw: any; text: string };
  }

  // Fallback: OpenAI-style API
  if (!OPENAI_KEY) throw new Error("Missing OPENAI_API_KEY or GEMINI_API_KEY in environment");

  const body = {
    model: options?.model || process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: options?.temperature ?? 0.2,
    max_tokens: options?.maxTokens ?? 1200,
  } as any;

  const res = await fetchWithRetry(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }, options?.retries ?? 1);

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || `OpenAI request failed with status ${res.status}`;
    throw new Error(msg);
  }

  const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text;
  return { raw: data, text: content } as { raw: any; text: string };
}

export default { callLLMWithPrompt };
