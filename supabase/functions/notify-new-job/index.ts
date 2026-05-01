import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  jobTitle: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  type: z.string().optional(),
  deadline: z.string().nullable().optional(),
});

const buildEmailHtml = (jobTitle: string, company: string, location?: string, type?: string, deadline?: string | null) => {
  const deadlineText = deadline
    ? `Application Deadline: ${new Date(deadline).toLocaleDateString("en-KE", { dateStyle: "long" })}`
    : "No specific deadline — apply soon!";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #1a365d, #2563eb); padding: 32px 24px; text-align: center;">
      <img src="https://ypqdeaarllhwnxyijshs.supabase.co/storage/v1/object/public/email-assets/logo.png" alt="M-Ploy" style="height: 40px; margin-bottom: 12px;" />
      <h1 style="color: #ffffff; margin: 0; font-size: 22px;">🚀 New Job Opportunity!</h1>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="color: #1a365d; margin: 0 0 8px; font-size: 20px;">${jobTitle}</h2>
      <p style="color: #6b7280; margin: 0 0 20px; font-size: 15px;">${company}${location ? ` · ${location}` : ""}${type ? ` · ${type}` : ""}</p>
      <div style="background: #f0f7ff; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
        <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 600;">${deadlineText}</p>
      </div>
      <div style="text-align: center;">
        <a href="https://mploy.lovable.app/jobs" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">View & Apply Now</a>
      </div>
    </div>
    <div style="padding: 20px 24px; background: #f9fafb;">
      <div style="text-align: center; margin-bottom: 12px;">
        <a href="https://mploy.lovable.app" style="color: #2563eb; text-decoration: none; font-size: 13px; margin: 0 8px;">Website</a>
        <span style="color: #d1d5db;">|</span>
        <a href="https://mploy.lovable.app/about" style="color: #2563eb; text-decoration: none; font-size: 13px; margin: 0 8px;">About</a>
        <span style="color: #d1d5db;">|</span>
        <a href="https://mploy.lovable.app/jobs" style="color: #2563eb; text-decoration: none; font-size: 13px; margin: 0 8px;">Jobs</a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">You're receiving this because you subscribed to M-Ploy job alerts.</p>
      <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0; text-align: center;">© ${new Date().getFullYear()} M-Ploy. Nairobi, Kenya</p>
    </div>
  </div>
</body>
</html>`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { jobTitle, company, location, type, deadline } = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: subscribers, error } = await supabase
      .from("newsletter_subscribers")
      .select("email");

    if (error) throw error;

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscribers to notify", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailSubject = `🚀 New Job Alert: ${jobTitle} at ${company}`;
    const emailHtml = buildEmailHtml(jobTitle, company, location, type, deadline);

    const SITE_NAME = "M-Ploy";
    const SENDER_DOMAIN = "notify.mploy.vercel.app";
    const FROM_DOMAIN = "notify.mploy.vercel.app";

    let enqueued = 0;
    for (const sub of subscribers) {
      try {
        const messageId = crypto.randomUUID();
        const idempotencyKey = `job-alert-${jobTitle}-${company}-${sub.email}`.replace(/\s+/g, "-").toLowerCase();

        await supabase.from("email_send_log").insert({
          message_id: messageId,
          template_name: "job_alert",
          recipient_email: sub.email,
          status: "pending",
        });

        await supabase.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: messageId,
            to: sub.email,
            from: `${SITE_NAME} Jobs <noreply@${FROM_DOMAIN}>`,
            sender_domain: SENDER_DOMAIN,
            subject: emailSubject,
            html: emailHtml,
            purpose: "transactional",
            label: "job_alert",
            idempotency_key: idempotencyKey,
            queued_at: new Date().toISOString(),
          },
        });
        enqueued++;
      } catch (e) {
        console.error(`Failed to enqueue for ${sub.email}:`, e);
      }
    }

    console.log(`Enqueued ${enqueued}/${subscribers.length} job alert emails for: ${jobTitle}`);

    return new Response(
      JSON.stringify({
        message: `Notification queued for ${enqueued} subscribers`,
        count: enqueued,
        job: { title: jobTitle, company, location, type, deadline },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
