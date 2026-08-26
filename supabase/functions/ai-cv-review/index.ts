import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { getIntegrationSetting } from "../_shared/integration-settings.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const apiKey = await getIntegrationSetting(admin, "openai_api_key");
    if (!apiKey) throw new Error("OpenAI is not configured in Admin → Integrations");

    const { cvData } = await req.json();
    if (!cvData) throw new Error("No CV data provided");

    const cvSummary = `
Name: ${cvData.fullName || "Not provided"}
Email: ${cvData.email || "Not provided"}
Summary: ${cvData.summary || "Not provided"}
Experience: ${cvData.experiences?.map((e: any) => `${e.title} at ${e.company}: ${e.description}`).join("; ") || "None"}
Education: ${cvData.educations?.map((e: any) => `${e.degree} from ${e.institution} (${e.year})`).join("; ") || "None"}
Skills: ${cvData.skills?.join(", ") || "None"}
    `.trim();

    const model = await getIntegrationSetting(admin, "openai_model") || "gpt-4o-mini";
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are an expert CV reviewer and ATS optimization specialist. Analyze CVs and provide actionable, specific suggestions to improve ATS compatibility and content quality. Be concise but thorough. Format your response as numbered suggestions. Focus on:
1. Keyword optimization for ATS systems
2. Content improvements (action verbs, quantifiable achievements)
3. Section-specific feedback
4. Missing elements that hurt ATS scores
5. Rewording suggestions for weak sections`,
          },
          {
            role: "user",
            content: `Please analyze this CV and provide specific improvement suggestions:\n\n${cvSummary}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const suggestions = data.choices?.[0]?.message?.content || "No suggestions available.";

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-cv-review error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
