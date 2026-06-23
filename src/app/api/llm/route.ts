import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface LLMRequest {
  provider: string;
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  maxTokens?: number;
  workspaceId: string;
}

const PROVIDER_ENDPOINTS: Record<string, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  mistral: "https://api.mistral.ai/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as LLMRequest;
  const { provider, model, messages, temperature = 0.7, maxTokens = 4096, workspaceId } = body;

  if (!provider || !model || !messages?.length || !workspaceId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Fetch API key from Supabase server-side
  const supabase = await createClient();
  const { data: wp } = await supabase
    .from("workspace_providers")
    .select("encrypted_api_key, base_url")
    .eq("workspace_id", workspaceId)
    .eq("provider_id", provider)
    .single();

  const apiKey = wp?.encrypted_api_key;
  if (!apiKey) {
    return NextResponse.json(
      { error: `No API key configured for ${provider}. Go to Settings > Secrets to add one.` },
      { status: 400 },
    );
  }

  try {
    if (provider === "anthropic") {
      return await handleAnthropic(apiKey, model, messages, temperature, maxTokens);
    }
    if (provider === "google") {
      return await handleGoogle(apiKey, model, messages, temperature, maxTokens);
    }
    // OpenAI-compatible: openai, mistral, openrouter, custom
    const endpoint = provider === "custom" ? (wp?.base_url || "") : PROVIDER_ENDPOINTS[provider];
    if (!endpoint) {
      return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }
    return await handleOpenAICompatible(endpoint, apiKey, model, messages, temperature, maxTokens, provider);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
  provider: string,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = "https://llmflowstudio.com";
    headers["X-Title"] = "LLM Flow Studio";
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${provider} API error (${res.status}): ${errText}`);
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function handleAnthropic(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
) {
  const systemMsg = messages.find((m) => m.role === "system");
  const userMessages = messages.filter((m) => m.role !== "system");

  const body: Record<string, unknown> = {
    model,
    messages: userMessages,
    max_tokens: maxTokens,
    temperature,
    stream: true,
  };
  if (systemMsg) body.system = systemMsg.content;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${errText}`);
  }

  // Transform Anthropic SSE to a unified format
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              // Re-emit as OpenAI-compatible SSE
              const chunk = {
                choices: [{ delta: { content: parsed.delta.text }, index: 0 }],
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
            if (parsed.type === "message_stop") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            }
            if (parsed.type === "message_delta" && parsed.usage) {
              const usage = {
                usage: {
                  prompt_tokens: parsed.usage.input_tokens ?? 0,
                  completion_tokens: parsed.usage.output_tokens ?? 0,
                },
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(usage)}\n\n`));
            }
          } catch {
            // Skip unparseable lines
          }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function handleGoogle(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
) {
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find((m) => m.role === "system");

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google API error (${res.status}): ${errText}`);
  }

  // Transform Google SSE to OpenAI-compatible format
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);

          try {
            const parsed = JSON.parse(data);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const chunk = {
                choices: [{ delta: { content: text }, index: 0 }],
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
          } catch {
            // Skip
          }
        }
      }
      controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
