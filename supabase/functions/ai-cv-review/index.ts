import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
