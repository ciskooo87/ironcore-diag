type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type ChatResult = {
  model: string;
  content: string;
  latencyMs: number;
};

const DEFAULT_BASE_URL = "https://api.x.ai/v1";
const DEFAULT_MODEL = "grok-2-latest";

export async function deepseekChat(messages: ChatMessage[]): Promise<ChatResult> {
  const apiKey = process.env.XAI_API_KEY || process.env.DEEPSEEK_API_KEY || "";
  const baseUrl = process.env.XAI_BASE_URL || process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.XAI_MODEL || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  const timeoutMs = Number(process.env.XAI_TIMEOUT_MS || process.env.DEEPSEEK_TIMEOUT_MS || 30000);

  if (!apiKey) throw new Error("xai_api_key_missing");

  const startedAt = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`xai_http_${res.status}:${text.slice(0, 300)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
    };

    const content = json.choices?.[0]?.message?.content?.trim() || "";
    return {
      model: json.model || model,
      content,
      latencyMs: Date.now() - startedAt,
    };
  } finally {
    clearTimeout(timer);
  }
}
