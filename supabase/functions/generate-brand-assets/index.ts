import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisualTheme {
  palette: { primary: string; secondary: string; accent: string };
  typography?: { heading?: string; body?: string };
  graphics?: { style?: "minimal" | "dynamic" | "elegant" | "technical" };
}

interface BrandAssetRequest {
  productName: string;
  productDescription?: string;
  industry?: string;
  visualStyle?: "minimal" | "dynamic" | "elegant" | "technical";
  theme?: VisualTheme;
  assets?: Array<"hero" | "pattern" | "shapes">;
  quality?: "high" | "medium" | "low";
}

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

function ensureOpenAI() {
  if (!openAIApiKey) throw new Error("Missing OPENAI_API_KEY secret");
}

function hslToReadable(hsl: string) {
  // expects "H S% L%" or "H,S%,L%" - normalize
  const cleaned = hsl.replace(/[,]/g, " ").trim();
  return cleaned;
}

function buildStyleKeywords(style?: string) {
  switch (style) {
    case "minimal":
      return "minimal, clean composition, generous whitespace, soft gradients, subtle grid";
    case "elegant":
      return "elegant, refined, premium, soft lighting, tasteful contrast, editorial feel";
    case "technical":
      return "technical, precise, modern, slightly futuristic, clean lines, isometric accents";
    default:
      return "dynamic, energetic, bold, contemporary, high-contrast, depth";
  }
}

function buildAssetPrompt(type: string, payload: BrandAssetRequest) {
  const style = payload.visualStyle || payload.theme?.graphics?.style || "dynamic";
  const styleKeywords = buildStyleKeywords(style);
  const palette = payload.theme?.palette;
  const p = palette
    ? `Primary hsl(${hslToReadable(palette.primary)}), Secondary hsl(${hslToReadable(palette.secondary)}), Accent hsl(${hslToReadable(palette.accent)})`
    : "Cohesive triadic palette in brand tones";

  const base = `Brand-consistent ${type} background for ${payload.productName}. Industry: ${payload.industry || "general"}. ${payload.productDescription || "High-quality modern product"}. Visual style: ${style}. Keywords: ${styleKeywords}. Color palette: ${p}. Avoid text, logos, or UI; deliver a clean asset.`;

  if (type === "hero") {
    return base + " 16:9 wide cinematic hero, professional lighting, depth, subtle gradient backdrop, room for overlaid heading on left.";
  }
  if (type === "pattern") {
    return base + " Seamless abstract pattern, subtle, repeatable, low noise, optimized for backgrounds.";
  }
  // shapes
  return base + " Abstract geometric shapes pack, transparent/solid background mix, layered depth, clean edges.";
}

async function generateImageBase64(prompt: string, quality: "high"|"medium"|"low" = "medium") {
  ensureOpenAI();
  const size = quality === "high" ? "1536x1024" : quality === "low" ? "1024x1024" : "1024x1024";
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openAIApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size,
      // gpt-image-1 returns b64_json always
      response_format: "b64_json",
      background: "auto",
      quality: quality === "high" ? "high" : quality === "low" ? "low" : "medium",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error: ${errText}`);
  }
  const data = await response.json();
  const b64 = data?.data?.[0]?.b64_json as string | undefined;
  if (!b64) throw new Error("No image returned");
  return `data:image/png;base64,${b64}`;
}

function fallbackSvg(type: string, color: string) {
  const svg =
    type === "pattern"
      ? `<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024'><defs><pattern id='p' width='40' height='40' patternUnits='userSpaceOnUse'><circle cx='20' cy='20' r='3' fill='hsl(${color})' /></pattern></defs><rect width='100%' height='100%' fill='white'/><rect width='100%' height='100%' fill='url(#p)'/></svg>`
      : `<svg xmlns='http://www.w3.org/2000/svg' width='1536' height='1024'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='hsl(${color})' stop-opacity='0.25'/><stop offset='100%' stop-color='hsl(${color})' stop-opacity='0.65'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as BrandAssetRequest;

    const assets = payload.assets?.length ? payload.assets : ["hero"];

    const results: Record<string, string> = {};
    for (const type of assets) {
      try {
        const prompt = buildAssetPrompt(type, payload);
        const img = await generateImageBase64(prompt, payload.quality || "medium");
        results[type] = img;
      } catch (err) {
        console.error(`Asset generation failed for ${type}:`, err);
        const color = payload.theme?.palette?.primary || "221 83% 53%";
        results[type] = fallbackSvg(type, hslToReadable(color));
      }
    }

    return new Response(JSON.stringify({ success: true, assets: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("generate-brand-assets error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
