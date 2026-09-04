/**
 * Nyrava Guardians — AI Provider Router
 * Server-side router abstracting Groq and Gemini adapters behind task classes.
 * Enforces timeouts, retries, failover, idempotency, and safe non-AI fallbacks per PDF directive.
 */
import { getProviderApiKey } from "../../lib/server/api-key-vault.ts";

export type TaskClass =
  | "guardian_dialogue"
  | "quick_hint"
  | "mission_feedback"
  | "classification"
  | "builder_planning"
  | "multimodal_understanding"
  | "complex_reasoning"
  | "safety_review";

export interface AIProviderRequest {
  idempotencyKey?: string;
  taskClass: TaskClass;
  prompt: string;
  context?: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
}

export interface AIProviderResponse {
  content: string;
  provider: "groq" | "gemini" | "fallback";
  model: string;
  latencyMs: number;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  safetyStatus: "passed" | "flagged" | "blocked";
  idempotencyKey?: string;
}

export interface ProviderAdapter {
  name: "groq" | "gemini";
  execute(request: AIProviderRequest, timeoutMs: number): Promise<AIProviderResponse>;
}

interface GroqResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

export class GroqAdapter implements ProviderAdapter {
  name = "groq" as const;

  async execute(request: AIProviderRequest, timeoutMs: number): Promise<AIProviderResponse> {
    const apiKey = await getProviderApiKey("groq");
    const startTime = Date.now();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: request.prompt }],
          max_tokens: request.maxTokens ?? 1024,
          temperature: request.temperature ?? 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`Groq API returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as GroqResponse;
      const latencyMs = Date.now() - startTime;
      const text = data.choices?.[0]?.message?.content ?? "";

      return {
        content: text,
        provider: "groq",
        model: "llama-3.3-70b-versatile",
        latencyMs,
        usage: {
          promptTokens: data.usage?.prompt_tokens ?? 0,
          completionTokens: data.usage?.completion_tokens ?? 0,
          totalTokens: data.usage?.total_tokens ?? 0,
        },
        safetyStatus: "passed",
        ...(request.idempotencyKey ? { idempotencyKey: request.idempotencyKey } : {}),
      };
    } catch (err: unknown) {
      clearTimeout(timer);
      const errMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`Groq Execution Error: ${errMsg}`);
    }
  }
}

export class GeminiAdapter implements ProviderAdapter {
  name = "gemini" as const;

  async execute(request: AIProviderRequest, timeoutMs: number): Promise<AIProviderResponse> {
    const apiKey = await getProviderApiKey("gemini");
    const startTime = Date.now();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: request.prompt }] }],
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`Gemini API returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as GeminiResponse;
      const latencyMs = Date.now() - startTime;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      return {
        content: text,
        provider: "gemini",
        model: "gemini-2.5-flash",
        latencyMs,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
        },
        safetyStatus: "passed",
        ...(request.idempotencyKey ? { idempotencyKey: request.idempotencyKey } : {}),
      };
    } catch (err: unknown) {
      clearTimeout(timer);
      const errMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`Gemini Execution Error: ${errMsg}`);
    }
  }
}

export class AIProviderRouter {
  private groq = new GroqAdapter();
  private gemini = new GeminiAdapter();
  private cache = new Map<string, AIProviderResponse>();

  private get config() {
    return {
      defaultProvider: process.env["AI_DEFAULT_PROVIDER"] ?? "groq",
      fallbackProvider: process.env["AI_FALLBACK_PROVIDER"] ?? "gemini",
      timeoutMs: Number(process.env["AI_TIMEOUT_MS"] ?? 30000),
      maxRetries: Number(process.env["AI_MAX_RETRIES"] ?? 2),
    };
  }

  async route(request: AIProviderRequest): Promise<AIProviderResponse> {
    if (request.idempotencyKey && this.cache.has(request.idempotencyKey)) {
      return this.cache.get(request.idempotencyKey)!;
    }

    const primary = this.config.defaultProvider === "gemini" ? this.gemini : this.groq;
    const secondary = this.config.defaultProvider === "gemini" ? this.groq : this.gemini;

    // Try primary adapter with retries
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const res = await primary.execute(request, this.config.timeoutMs);
        if (request.idempotencyKey) this.cache.set(request.idempotencyKey, res);
        return res;
      } catch {
        if (attempt === this.config.maxRetries) break;
      }
    }

    // Try fallback adapter
    try {
      const res = await secondary.execute(request, this.config.timeoutMs);
      if (request.idempotencyKey) this.cache.set(request.idempotencyKey, res);
      return res;
    } catch {
      // Safe non-AI fallback response
      const fallbackRes: AIProviderResponse = {
        content:
          "I am analyzing your request right now! Stay safe and keep demonstrating your Guardian skills.",
        provider: "fallback",
        model: "safe-fallback-v1",
        latencyMs: 0,
        safetyStatus: "passed",
        ...(request.idempotencyKey ? { idempotencyKey: request.idempotencyKey } : {}),
      };
      if (request.idempotencyKey) this.cache.set(request.idempotencyKey, fallbackRes);
      return fallbackRes;
    }
  }
}

export const aiRouter = new AIProviderRouter();
