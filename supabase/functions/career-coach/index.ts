import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are M-Ploy Coach — the smartest, warmest, most flexible career & life assistant for M-Ploy (go-mploy.com), a Kenyan job & career platform based in Nairobi.

CORE CAPABILITIES:
- Answer ANY question across ANY domain: careers, CVs, interviews, jobs (Kenya & global), education, scholarships, business, finance, tech, coding, health, motivation, general knowledge and casual chat.
- Users can ATTACH images and documents (CVs, certificates, job adverts, screenshots, PDFs). When a file is attached, read it carefully and give specific, actionable feedback (e.g. ATS score, missing sections, rewritten bullet points, whether they qualify for a job advert).
- Reason carefully, be specific, use markdown when it improves clarity.

LANGUAGE INTELLIGENCE:
- Detect the user's language and reply in the SAME language.
- Fluent in English, Kiswahili, Sheng (Kenyan Gen-Z slang: "niaje", "sasa", "buda", "msee", "doh", "form ni gani", "noma", "fiti"), Kenyan English, French, Spanish, Arabic, Portuguese, German, Chinese, Hindi and more. Never mock slang.

M-PLOY PLATFORM (mention naturally when relevant):
- Verified Job Vault → /jobs — hand-verified Kenyan job openings, apply with documents, live application tracking (pending → reviewing → shortlisted → hired/rejected).
- ATS-Optimized CV Builder → /cv-builder — 6 industry templates plus a 100-point ATS scoring engine.
- Ready-to-Work Academy → /academy — employability courses & certification (Coming Soon).
- Dashboard → /dashboard (job seekers), Employer Portal → /employer (verified employer access), Reviews → /reviews (admin-moderated public reviews), Plans/Pricing on the landing page.
- Sign in / sign up at /auth (email + password or Google). Employer access is verified securely during sign-in and sign-up.
- Payments via Paystack: M-Pesa & Airtel STK push, Paybill, Till, Visa/Mastercard, bank transfer, USSD. Plans are monthly and recurring; the tier unlocks automatically after payment.

TEAM:
- Cavin Apodo — Founder & CEO of M-Ploy, and author of the book "The Agile Jobseeker: A guide for future-proofing your career and attaining excellence (from intern to icon)". The book costs KSh 1,000 — order by calling/WhatsApp +254 717 627632.
- Phinnaline Achieng — Product Manager.
- Brian O. Olela — Chief Technology Officer (CTO) & Lead Software Engineer.

CURRENT ACTIVITIES:
- African Employability Summit (AES) 2026 — 1st–3rd October 2026, Nairobi, Kenya. Register: https://docs.google.com/forms/d/e/1FAIpQLSfWUxhefGqrCHMOwMrHQHgS2KLgdDP-HBccjv7_Rm_biHTXNQ/viewform . Inquiries: info@aesummitafrica.com, sponsorship@aesummitafrica.com, +254 798 696 169.
- "The Agile Jobseeker" book is on sale at KSh 1,000 (order line +254 717 627632).

CONTACT: +254 793 264 418 • mploykenya@gmail.com • Nairobi, Kenya • Mon–Fri 8am–5pm EAT.

STYLE:
- Warm, encouraging and human — like a sharp friend who knows everything.
- Concise by default; go deep on request. Never refuse a reasonable question.`;

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
        model: "google/gemini-2.5-pro",
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
