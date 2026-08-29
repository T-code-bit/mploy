import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import sanitizeHtml from "npm:sanitize-html@2.14.0";
import { getIntegrationSetting } from "../_shared/integration-settings.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
type Audience = "all_users" | "active_subscribers" | "newsletter" | "selected_users";
type AuthUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };

function cleanHtml(input: string) {
  // Keep the deliberately small subset emitted by the composer. sanitize-html
  // also removes event handlers, scripts, malformed tags, and unsafe schemes.
  return sanitizeHtml(input, {
    allowedTags: ["a", "b", "strong", "i", "em", "u", "s", "strike", "h1", "h2", "h3", "p", "div", "blockquote", "ul", "ol", "li", "br", "span", "img"],
    allowedAttributes: {
      a: ["href", "target", "rel", "title", "style"],
      img: ["src", "alt", "width", "height", "style"],
      "*": ["style"],
    },
    allowedSchemes: ["http", "https"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i],
        "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i],
        "text-align": [/^(left|center|right|justify)$/],
        "max-width": [/^\d+%$/],
        height: [/^auto$/],
        "border-radius": [/^\d+px$/],
      },
    },
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" } }),
    },
  }).trim();
}
const plainText = (html: string) => html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();

async function allAuthUsers(admin: ReturnType<typeof createClient>) {
  const users: AuthUser[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Could not list users: ${error.message}`);
    users.push(...((data?.users ?? []) as AuthUser[]));
    if ((data?.users ?? []).length < 1000) break;
  }
  return users;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL") ?? "", serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Unauthorized" }, 401);
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const asUser = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: userData } = await asUser.auth.getUser();
    if (!userData?.user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden — admin only" }, 403);

    const body = await req.json().catch(() => ({}));
    if (body.action === "search_users") {
      const query = String(body.query ?? "").trim().toLowerCase();
      if (query.length < 2) return json({ users: [] });
      const users = await allAuthUsers(admin);
      const { data: profiles } = await admin.from("profiles").select("user_id, full_name").in("user_id", users.map((u) => u.id));
      const names = new Map((profiles ?? []).map((p: { user_id: string; full_name: string }) => [p.user_id, p.full_name]));
      return json({ users: users.filter((u) => `${u.email ?? ""} ${names.get(u.id) ?? ""} ${String(u.user_metadata?.username ?? "")}`.toLowerCase().includes(query)).slice(0, 50).map((u) => ({ id: u.id, email: u.email ?? "", name: names.get(u.id) ?? String(u.user_metadata?.username ?? "") })) });
    }

    const subject = String(body.subject || "").trim(), rawHtml = String(body.body || "").trim();
    const audience = body.audience as Audience;
    if (!subject || !rawHtml) return json({ error: "Subject and message are required" }, 400);
    if (!["all_users", "active_subscribers", "newsletter", "selected_users"].includes(audience)) return json({ error: "Invalid audience" }, 400);
    const html = cleanHtml(rawHtml), text = plainText(html);
    if (!text) return json({ error: "Message cannot be empty" }, 400);

    let emails: string[] = [];
    if (audience === "newsletter") {
      const { data, error } = await admin.from("newsletter_subscribers").select("email");
      if (error) throw new Error(error.message); emails = (data ?? []).map((r: { email: string }) => r.email);
    } else if (audience === "active_subscribers") {
      const { data, error } = await admin.from("paystack_subscribers").select("email").eq("status", "active");
      if (error) throw new Error(error.message); emails = (data ?? []).map((r: { email: string }) => r.email);
    } else {
      const users = await allAuthUsers(admin);
      const ids = audience === "selected_users" ? Array.from(new Set((Array.isArray(body.selected_user_ids) ? body.selected_user_ids : []).filter((id: unknown) => typeof id === "string"))).slice(0, 500) : null;
      if (audience === "selected_users" && !ids?.length) return json({ error: "Select at least one recipient" }, 400);
      emails = users.filter((u) => !ids || ids.includes(u.id)).map((u) => u.email ?? "");
    }
    emails = Array.from(new Set(emails.map((email) => email.trim().toLowerCase()).filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))));
    if (!emails.length) return json({ error: "No deliverable recipients were found for this audience" }, 400);

    const [apiKey, from] = await Promise.all([getIntegrationSetting(admin, "resend_api_key"), getIntegrationSetting(admin, "resend_from_email")]);
    if (!apiKey || !from) return json({ error: "Resend is not configured. Save both the API key and verified From address in Admin → Integrations." }, 503);

    const { data: record, error: logError } = await admin.from("admin_broadcasts").insert({ sender_id: userData.user.id, audience, subject, body: html, recipient_count: emails.length, status: "queueing" }).select("id").single();
    if (logError) throw new Error(`Could not record broadcast: ${logError.message}`);
    let queued = 0, failed = 0;
    const queueErrors: string[] = [];
    const queueRecipient = async (to: string) => {
      try {
        const payload = { message_id: crypto.randomUUID(), queued_at: new Date().toISOString(), to, subject, html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:auto;padding:24px">${html}</div>`, text, label: "admin_broadcast", template_name: "admin_broadcast", purpose: "transactional" };
        const { error } = await admin.rpc("enqueue_email", { queue_name: "transactional_emails", payload });
        if (error) throw error;
        return true;
      } catch (error) {
        queueErrors.push(error instanceof Error ? error.message : String(error));
        return false;
      }
    };
    // Avoid opening an unbounded number of database RPCs for large audiences.
    const concurrency = 20;
    for (let offset = 0; offset < emails.length; offset += concurrency) {
      const results = await Promise.all(emails.slice(offset, offset + concurrency).map(queueRecipient));
      queued += results.filter(Boolean).length;
      failed += results.filter((result) => !result).length;
    }
    const status = failed ? (queued ? "partially_queued" : "queue_failed") : "queued";
    const queueError = failed ? `${failed} recipient(s) could not be queued${queueErrors[0] ? `: ${queueErrors[0].slice(0, 500)}` : ""}` : null;
    const { error: auditError } = await admin.from("admin_broadcasts").update({ queued_count: queued, failed_count: failed, status, queue_error: queueError }).eq("id", record.id);
    if (auditError) throw new Error(`Recipients were queued, but broadcast audit update failed: ${auditError.message}`);
    if (!queued) return json({ error: "The broadcast could not be queued. Check the email queue configuration.", broadcast_id: record.id, total_recipients: emails.length, queued, failed, status }, 502);
    return json({ ok: true, broadcast_id: record.id, total_recipients: emails.length, queued, failed, status }, failed ? 207 : 200);
  } catch (err) { return json({ error: err instanceof Error ? err.message : "Broadcast failed" }, 500); }
});