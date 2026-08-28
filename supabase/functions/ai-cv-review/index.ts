import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { getIntegrationSetting } from "../_shared/integration-settings.ts";

const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_MODEL_FALLBACKS = [DEFAULT_GEMINI_MODEL, "gemini-3.6-flash", "gemini-flash-latest"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const readJsonBody = async (req: Request, maxBytes: number) => {
  if (!req.body) throw new Error("Request body is required");
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error("Request is too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
};

const safeText = (value: unknown, max = 4_000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Sign in to use AI CV review." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: allowed, error: quotaError } = await admin.rpc("consume_career_coach_quota", {
      p_user_id: userData.user.id,
      p_limit: 20,
    });
    if (quotaError) throw quotaError;
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Server Currently Busy" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const apiKey = await getIntegrationSetting(admin, "gemini_api_key");
    if (!apiKey) {
      console.error("ai-cv-review: Gemini API key is not configured");
      return new Response(JSON.stringify({ error: "Server Currently Busy" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let cvData: Record<string, any>;
    try {
      const body = await readJsonBody(req, 512 * 1024);
      if (!body?.cvData || typeof body.cvData !== "object" || Array.isArray(body.cvData)) {
        throw new Error("No CV data provided");
      }
      cvData = body.cvData;
    } catch (error) {
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Invalid CV data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const experiences = Array.isArray(cvData.experiences) ? cvData.experiences.slice(0, 30) : [];
    const educations = Array.isArray(cvData.educations) ? cvData.educations.slice(0, 20) : [];
    const skills = Array.isArray(cvData.skills) ? cvData.skills.slice(0, 100) : [];

    const cvSummary = `
Name: ${safeText(cvData.fullName, 200) || "Not provided"}
Email: ${safeText(cvData.email, 320) || "Not provided"}
Summary: ${safeText(cvData.summary, 8_000) || "Not provided"}
Experience: ${experiences.map((e: any) => `${safeText(e?.title, 300)} at ${safeText(e?.company, 300)}: ${safeText(e?.description, 4_000)}`).join("; ") || "None"}
Education: ${educations.map((e: any) => `${safeText(e?.degree, 300)} from ${safeText(e?.institution, 300)} (${safeText(e?.year, 40)})`).join("; ") || "None"}
Skills: ${skills.map((skill: unknown) => safeText(skill, 100)).filter(Boolean).join(", ") || "None"}
    `.trim().slice(0, 60_000);

    const configuredModel = await getIntegrationSetting(admin, "gemini_model");
    const model = configuredModel && /^[a-zA-Z0-9._:-]{1,100}$/.test(configuredModel)
      ? configuredModel
      : DEFAULT_GEMINI_MODEL;
    const callGemini = (candidateModel: string) => fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(candidateModel)}:generateContent`,
      {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `You are an expert CV reviewer and ATS optimization specialist. Analyze CVs and provide actionable, specific suggestions to improve ATS compatibility and content quality. Be concise but thorough. Format your response as numbered suggestions. Focus on:
1. Keyword optimization for ATS systems
2. Content improvements (action verbs, quantifiable achievements)
3. Section-specific feedback
4. Missing elements that hurt ATS scores
5. Rewording suggestions for weak sections` }],
        },
        contents: [{
          role: "user",
          parts: [{ text: `Please analyze this CV and provide specific improvement suggestions:\n\n${cvSummary}` }],
        }],
        generationConfig: { maxOutputTokens: 1200, temperature: 0.35 },
      }),
      },
    );
    let activeModel = model;
    let response = await callGemini(activeModel);
    for (const fallbackModel of GEMINI_MODEL_FALLBACKS) {
      if (response.status !== 400 && response.status !== 404) break;
      if (fallbackModel === activeModel) continue;
      const detail = await response.text().catch(() => "");
      console.warn("Gemini CV review model unavailable:", activeModel, response.status, detail.slice(0, 300));
      activeModel = fallbackModel;
      response = await callGemini(activeModel);
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Server Currently Busy" }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("Gemini CV review error:", response.status, text.slice(0, 500));
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const suggestions = data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim() || "No suggestions available.";

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-cv-review error:", e);
    return new Response(JSON.stringify({ error: "Server Currently Busy" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
