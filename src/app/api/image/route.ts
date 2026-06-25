import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ImageRequest {
  provider: string;
  model: string;
  prompt: string;
  size?: string;
  quality?: string;
  workspaceId: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ImageRequest;
  const { provider, model, prompt, size = "1024x1024", quality = "standard", workspaceId } = body;

  if (!provider || !model || !prompt || !workspaceId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Fetch API key from Supabase
  const supabase = await createClient();
  const { data: wp } = await supabase
    .from("workspace_providers")
    .select("encrypted_api_key, base_url")
    .eq("workspace_id", workspaceId)
    .eq("provider_id", provider === "openai" ? "openai" : "google")
    .single();

  const apiKey = wp?.encrypted_api_key;
  if (!apiKey) {
    return NextResponse.json(
      { error: `No API key configured for ${provider}. Go to Settings > Secrets to add one.` },
      { status: 400 },
    );
  }

  try {
    if (provider === "openai") {
      return await handleOpenAIImage(apiKey, model, prompt, size, quality);
    }
    if (provider === "google") {
      return await handleGoogleImage(apiKey, model, prompt);
    }
    return NextResponse.json({ error: `Unsupported image provider: ${provider}` }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleOpenAIImage(
  apiKey: string,
  model: string,
  prompt: string,
  size: string,
  quality: string,
) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size,
      quality,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI Image API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) {
    throw new Error("No image URL returned from OpenAI");
  }

  return NextResponse.json({ url });
}

async function handleGoogleImage(
  apiKey: string,
  model: string,
  prompt: string,
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Image API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts;

  if (!parts?.length) {
    throw new Error("No content returned from Google Imagen");
  }

  // Look for inline image data (base64)
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      const dataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      return NextResponse.json({ url: dataUrl });
    }
  }

  // Fallback: look for text response describing the image
  const textPart = parts.find((p: { text?: string }) => p.text);
  if (textPart?.text) {
    throw new Error(`Google returned text instead of image: ${textPart.text.slice(0, 200)}`);
  }

  throw new Error("No image data returned from Google Imagen");
}
