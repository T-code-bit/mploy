import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { getIntegrationSetting } from "../_shared/integration-settings.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_ATTACHMENT_COUNT = 3;

const getDataUrlBytes = (value: unknown) => {
  if (typeof value !== "string") return 0;
  const match = value.match(/^data:([^;,]+)?;base64,([A-Za-z0-9+/=_-]+)$/);
  if (!match) return 0;
  const encoded = match[2].replace(/-/g, "+").replace(/_/g, "/");
  const padding = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor(encoded.length * 3 / 4) - padding);
};

const validateAttachments = (messages: unknown[]) => {
  let count = 0;
  let totalBytes = 0;

  for (const message of messages) {
    if (!message || typeof message !== "object" || !Array.isArray((message as { content?: unknown }).content)) continue;
    for (const part of (message as { content: unknown[] }).content) {
      if (!part || typeof part !== "object") continue;
      const candidate = part as { type?: unknown; image_url?: { url?: unknown }; file?: { file_data?: unknown } };
      const dataUrl = candidate.type === "image_url"
        ? candidate.image_url?.url
        : candidate.type === "file"
          ? candidate.file?.file_data
          : undefined;
      if (typeof dataUrl !== "string") continue;
      count += 1;
      totalBytes += getDataUrlBytes(dataUrl);
    }
  }

  if (count > MAX_ATTACHMENT_COUNT) {
    return "Attach up to 3 files at a time.";
  }
  if (totalBytes > MAX_ATTACHMENT_BYTES) {
    return "Attachments are too large. Keep the combined file size at 5MB or less.";
  }
  return null;
};

const parseOpenAIError = (body: string) => {
  try {
    const parsed = JSON.parse(body);
    return {
      code: typeof parsed?.error?.code === "string" ? parsed.error.code : "",
      type: typeof parsed?.error?.type === "string" ? parsed.error.type : "",
    };
  } catch {
    return { code: "", type: "" };
  }
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
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 8 * 1024 * 1024) {
      return json({ error: "Attachments are too large. Keep the combined file size at 5MB or less." }, 413);
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return json({ error: "Send between 1 and 30 messages." }, 400);
    }
    const attachmentError = validateAttachments(messages);
    if (attachmentError) return json({ error: attachmentError }, 413);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const apiKey = await getIntegrationSetting(admin, "openai_api_key");
    if (!apiKey) {
      return json({ error: "AI is not configured in Admin → Integrations." }, 503);
    }

    const configuredModel = await getIntegrationSetting(admin, "openai_model");
    const model = configuredModel && /^[a-zA-Z0-9._:-]{1,100}$/.test(configuredModel)
      ? configuredModel
      : "gpt-4o-mini";

    const callOpenAI = () =>
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          stream: true,
          max_tokens: 1200,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        }),
      });

    let upstream = await callOpenAI();
    let upstreamError = "";

    if (upstream.status === 429) {
      upstreamError = await upstream.text();
      const details = parseOpenAIError(upstreamError);
      const isQuotaError = details.code === "insufficient_quota" || details.type === "insufficient_quota";

      if (!isQuotaError) {
        await wait(1200);
        upstream = await callOpenAI();
        if (!upstream.ok) upstreamError = await upstream.text();
      }
    }

    if (!upstream.ok) {
      const errText = upstreamError || await upstream.text();
      const details = parseOpenAIError(errText);
      if (upstream.status === 429) {
        if (details.code === "insufficient_quota" || details.type === "insufficient_quota") {
          return json({
            error: "OpenAI account quota is exhausted. Add billing or credits to the configured OpenAI account, then use Test OpenAI in Admin → Integrations.",
            code: "openai_quota_exhausted",
          }, 402);
        }
        return json({
          error: "OpenAI is temporarily rate-limiting requests. Please retry shortly.",
          code: "openai_rate_limited",
        }, 429);
      }
      if (upstream.status === 401 || upstream.status === 403) {
        return json({
          error: "The configured OpenAI API key was rejected. Replace it in Admin → Integrations.",
          code: "openai_key_rejected",
        }, 502);
      }
      if (upstream.status === 400 || upstream.status === 404) {
        return json({
          error: `The configured OpenAI model (${model}) is unavailable or cannot process this request.`,
          code: "openai_model_error",
        }, 502);
      }
      return json({ error: "The AI provider is temporarily unavailable." }, 502);
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
    console.error("career-coach error:", msg);
    return json({ error: "The Career Coach could not process this request." }, 500);
  }
});
