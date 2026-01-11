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
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

let cachedGemini: { baseUrl: string; model: string } | null = null;

function safeJsonParse(text: string): { ok: true; value: any } | { ok: false; error: unknown } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error };
  }
}

function extractGeminiText(data: any): string {
  // generateContent response shape (most common)
  const parts = data?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const text = parts.map((p: any) => p?.text).filter(Boolean).join("");
    if (text) return text;
  }

  // Older/alternate shapes seen in some SDKs
  const alt =
    data?.candidates?.[0]?.output ??
    data?.candidates?.[0]?.content ??
    data?.output ??
    data?.text;

  if (typeof alt === "string") return alt;
  return JSON.stringify(data ?? {});
}

function normalizeGeminiModelName(name: string): string {
  // API may return "models/<id>". Requests must use just "<id>".
  return name.startsWith("models/") ? name.slice("models/".length) : name;
}

async function listGeminiModels(baseUrl: string): Promise<any[]> {
  const url = `${baseUrl}/models?key=${GEMINI_KEY}`;
  const res = await fetchWithRetry(url, { method: "GET" }, 1);
  const raw = await res.text();
  const parsed = safeJsonParse(raw);
  if (!res.ok) {
    const msg =
      (parsed.ok ? parsed.value?.error?.message || parsed.value?.message : null) ||
      `Gemini listModels failed with status ${res.status}`;
    throw new Error(`${msg} (base: ${baseUrl})`);
  }
  if (!parsed.ok) {
    throw new Error(`Gemini listModels returned non-JSON (base: ${baseUrl}): ${raw.slice(0, 300)}`);
  }
  return Array.isArray(parsed.value?.models) ? parsed.value.models : [];
}

function pickGeminiModel(models: any[], preferred?: string): string | null {
  const normalizedPreferred = preferred ? normalizeGeminiModelName(preferred) : null;
  const supportsGenerateContent = (m: any) =>
    Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent");

  // 1) Prefer user-configured model if it exists + supports generateContent
  if (normalizedPreferred) {
    const hit = models.find((m: any) => normalizeGeminiModelName(String(m?.name ?? "")) === normalizedPreferred);
    if (hit && supportsGenerateContent(hit)) return normalizedPreferred;
  }

  // 2) Prefer 1.5 Flash, then 1.5 Pro, then anything Gemini that supports generateContent
  const ranked = models
    .filter(supportsGenerateContent)
    .map((m: any) => normalizeGeminiModelName(String(m?.name ?? "")))
    .filter((n: string) => !!n);

  const preferOrder = [
    /gemini-1\.5-flash/i,
    /gemini-1\.5-pro/i,
    /gemini/i,
  ];

  for (const re of preferOrder) {
    const found = ranked.find((n) => re.test(n));
    if (found) return found;
  }

  return ranked[0] ?? null;
}

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
    // Use the Google Generative Language API generateContent endpoint
    // Endpoint: https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={API_KEY}
    const requestedModel = options?.model || GEMINI_MODEL;
    const configuredBaseUrl = process.env.GEMINI_API_URL;
    const baseCandidates = configuredBaseUrl
      ? [configuredBaseUrl]
      : ["https://generativelanguage.googleapis.com/v1", "https://generativelanguage.googleapis.com/v1beta"];

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
    } as any;

    const doRequest = async (baseUrl: string, model: string) => {
      const url = `${baseUrl}/models/${model}:generateContent?key=${GEMINI_KEY}`;
      return fetchWithRetry(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        options?.retries ?? 1
      );
    };

    const tried: Array<{ baseUrl: string; model: string; status?: number; msg?: string }> = [];

    // First: if we've already discovered a working combo in this process, try it.
    if (cachedGemini) {
      const res = await doRequest(cachedGemini.baseUrl, cachedGemini.model);
      const raw = await res.text();
      const parsed = safeJsonParse(raw);
      const data = parsed.ok ? parsed.value : null;
      if (res.ok && parsed.ok) {
        return { raw: data, text: extractGeminiText(data) } as { raw: any; text: string };
      }
      tried.push({
        baseUrl: cachedGemini.baseUrl,
        model: cachedGemini.model,
        status: res.status,
        msg: parsed.ok ? (data?.error?.message || data?.message) : String(parsed.error),
      });
      cachedGemini = null;
    }

    for (const baseUrl of baseCandidates) {
      // Attempt 1: requested model (as-is, but normalized)
      const m1 = normalizeGeminiModelName(requestedModel);
      {
        const res = await doRequest(baseUrl, m1);
        const raw = await res.text();
        const parsed = safeJsonParse(raw);
        const data = parsed.ok ? parsed.value : null;
        if (res.ok && parsed.ok) {
          cachedGemini = { baseUrl, model: m1 };
          return { raw: data, text: extractGeminiText(data) } as { raw: any; text: string };
        }
        const msg = parsed.ok ? (data?.error?.message || data?.message) : String(parsed.error);
        tried.push({ baseUrl, model: m1, status: res.status, msg });
      }

      // Attempt 2: listModels and pick something that supports generateContent
      try {
        const models = await listGeminiModels(baseUrl);
        const picked = pickGeminiModel(models, requestedModel);
        if (picked) {
          const res = await doRequest(baseUrl, picked);
          const raw = await res.text();
          const parsed = safeJsonParse(raw);
          const data = parsed.ok ? parsed.value : null;
          if (res.ok && parsed.ok) {
            cachedGemini = { baseUrl, model: picked };
            return { raw: data, text: extractGeminiText(data) } as { raw: any; text: string };
          }
          const msg = parsed.ok ? (data?.error?.message || data?.message) : String(parsed.error);
          tried.push({ baseUrl, model: picked, status: res.status, msg });
        }
      } catch (e: any) {
        tried.push({ baseUrl, model: "<listModels>", msg: e?.message ?? String(e) });
      }
    }

    const summary = tried
      .map((t) => `${t.baseUrl} :: ${t.model}${t.status ? ` (${t.status})` : ""}${t.msg ? ` - ${t.msg}` : ""}`)
      .join(" | ");
    throw new Error(`Gemini request failed. Tried: ${summary}`);
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

  const rawText = await res.text();
  const parsed = safeJsonParse(rawText);
  const data = parsed.ok ? parsed.value : null;

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      data?.message ||
      `OpenAI request failed with status ${res.status}`;
    const details = parsed.ok ? undefined : String(parsed.error);
    throw new Error(`${msg}${details ? ` (non-JSON response: ${details})` : ""}`);
  }

  if (!parsed.ok) {
    throw new Error(`OpenAI returned non-JSON response (status ${res.status}): ${rawText.slice(0, 300)}`);
  }

  const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text;
  return { raw: data, text: content } as { raw: any; text: string };
}

export default { callLLMWithPrompt };
