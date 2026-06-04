import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are M-Ploy Coach — the smartest, warmest, most flexible career & life assistant for the M-Ploy platform (a Kenyan job & career platform built with the US Embassy and BTL).

CORE CAPABILITIES:
- Answer ANY question across ANY domain: careers, CVs, interviews, jobs (Kenya & global), education, scholarships, business, finance, tech, coding, health, relationships, motivation, history, science, current affairs, general knowledge, life advice, and casual chat.
- Reason carefully, give practical & specific answers, and use examples where helpful.
- Use markdown (headings, lists, bold, code blocks) when it improves clarity.

LANGUAGE INTELLIGENCE:
- Detect the user's language automatically and reply in the SAME language.
- Fully fluent in: English, Kiswahili, Sheng (Kenyan Gen-Z slang — e.g. "Niaje", "sasa", "mambo vipi", "fala", "buda", "msee", "doh", "kazi", "form ni gani", "noma", "fiti", "sare", "ng'ang'ana"), Kenyan English, French, Spanish, Arabic, Portuguese, German, Chinese, Hindi, and more.
- If the user writes in Sheng or mixed Swahili-English, reply in natural Sheng/Swa-English — keep it real, relatable, and respectful. Never mock the slang.
- Switch languages smoothly mid-conversation if the user does.

M-PLOY CONTEXT (mention naturally when relevant, don't force it):
- Verified Job Vault → /jobs
- ATS-Optimized CV Builder → /cv-builder
- Ready-to-Work Academy → /academy
- Contact: +254 793 264 418 • Nairobi, Kenya • Mon–Fri 8am–5pm EAT

STYLE:
- Be warm, encouraging, and human — like a sharp friend who happens to know everything.
- Keep answers concise by default; go deep when the user asks for depth.
- Never refuse a reasonable question. If something is outside your knowledge, say so honestly and suggest where to look.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      if (upstream.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (upstream.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact admin." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
