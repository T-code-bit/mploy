import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type Audience = "all_users" | "active_subscribers" | "newsletter";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const asUser = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData } = await asUser.auth.getUser();
    if (!userData?.user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden — admin only" }, 403);

    const body = await req.json().catch(() => ({}));
    const subject = String(body.subject || "").trim();
    const messageBody = String(body.body || "").trim();
    const audience: Audience = (body.audience || "all_users") as Audience;

    if (!subject || !messageBody) return json({ error: "Subject and message are required" }, 400);

    // Collect recipient emails
    let emails: string[] = [];

    if (audience === "newsletter") {
      const { data } = await admin.from("newsletter_subscribers").select("email");
      emails = (data ?? []).map((r: { email: string }) => r.email).filter(Boolean);
    } else if (audience === "active_subscribers") {
      const { data } = await admin.from("paystack_subscribers").select("email").eq("status", "active");
      emails = (data ?? []).map((r: { email: string }) => r.email).filter(Boolean);
    } else {
      // all users from auth
      const { data: usersPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      emails = (usersPage?.users ?? []).map((u) => u.email || "").filter(Boolean);
    }

    // De-duplicate
    emails = Array.from(new Set(emails.map((e) => e.toLowerCase())));

    // Log the broadcast
    const { error: logErr } = await admin.from("admin_broadcasts").insert({
      sender_id: userData.user.id,
      audience,
      subject,
      body: messageBody,
      recipient_count: emails.length,
    });
    if (logErr) console.warn("Broadcast log failed:", logErr.message);

    // Enqueue emails through existing email queue (best-effort)
    let queued = 0;
    for (const to of emails) {
      const payload = {
        to,
        subject,
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
                 <h2 style="color:#0f766e;">${subject}</h2>
                 <div style="line-height:1.6;color:#333;white-space:pre-line;">${messageBody.replace(/</g, "&lt;")}</div>
                 <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
                  <p style="font-size:12px;color:#888;">Sent by M-Ploy Kenya · <a href="https://go-mploy.com">go-mploy.com</a></p>
               </div>`,
        text: messageBody,
        template_name: "admin_broadcast",
        purpose: "transactional",
      };
      try {
        const { error } = await admin.rpc("enqueue_email", { queue_name: "transactional_emails", payload });
        if (!error) queued++;
      } catch (_) {
        // ignore individual failures
      }
    }

    return json({ ok: true, total_recipients: emails.length, queued });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Broadcast failed" }, 500);
  }
});
