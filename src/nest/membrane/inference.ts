// The pluggable inference seam (ADR-004 Decision 4): every semantic task of
// the simulated machine goes through this port. The first adapter is
// Together AI; a machine without a credential gets the null adapter and the
// deterministic fallbacks in lib/guide.ts take over. Swapping providers is an
// assembly change, never a task-code change.

export type InferenceRequest = {
  system: string;
  user: string;
  maxTokens?: number;
};

export interface InferencePort {
  readonly id: string;
  // Resolves with the raw completion text, or null on any expected failure
  // (missing key, transport error, timeout, empty answer).
  complete(request: InferenceRequest): Promise<string | null>;
}

class TogetherInference implements InferencePort {
  readonly id = "together";
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly timeoutMs = 60_000
  ) {}

  async complete(request: InferenceRequest): Promise<string | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.3,
          max_tokens: request.maxTokens ?? 1400,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: request.system },
            { role: "user", content: request.user }
          ]
        })
      });
      if (!response.ok) return null;
      const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content ?? null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}

class NullInference implements InferencePort {
  readonly id = "none";
  async complete(): Promise<string | null> {
    return null;
  }
}

// Assembly: resolved from the environment once per process.
let assembled: InferencePort | null = null;

export function inference(): InferencePort {
  if (assembled) return assembled;
  const key = process.env.TOGETHER_API_KEY;
  assembled = key
    ? new TogetherInference(key, process.env.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo")
    : new NullInference();
  return assembled;
}
