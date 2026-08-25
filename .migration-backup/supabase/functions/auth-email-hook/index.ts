import { createClient } from "npm:@supabase/supabase-js@2"
import { getIntegrationSetting } from "../_shared/integration-settings.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const subjects: Record<string, string> = {
  signup: "Confirm your email",
  invite: "You've been invited to M-Ploy",
  magiclink: "Your M-Ploy sign-in link",
  recovery: "Reset your M-Ploy password",
  email_change: "Confirm your new email address",
  reauthentication: "Your verification code",
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const htmlEmail = (title: string, body: string, actionUrl?: string, actionLabel?: string) => `<!doctype html>
<html><body style="margin:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#172033">
  <main style="max-width:560px;margin:32px auto;background:#fff;border-radius:14px;padding:36px 28px">
    <h1 style="margin:0 0 16px;color:#1a365d;font-size:24px">${escapeHtml(title)}</h1>
    <p style="line-height:1.6">${escapeHtml(body)}</p>
    ${actionUrl ? `<p style="margin:28px 0"><a href="${actionUrl}" style="display:inline-block;background:#1a365d;color:white;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:bold">${escapeHtml(actionLabel || "Continue")}</a></p>` : ""}
    <p style="font-size:12px;color:#667085;line-height:1.5">If you did not request this email, you can safely ignore it.</p>
  </main>
</body></html>`

function verificationUrl(supabaseUrl: string, tokenHash: string, action: string, redirectTo: string) {
  const url = new URL(`${supabaseUrl}/auth/v1/verify`)
  url.searchParams.set("token", tokenHash)
  url.searchParams.set("type", action)
  url.searchParams.set("redirect_to", redirectTo)
  return url.toString()
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders })

  try {
    const expectedSecret = Deno.env.get("AUTH_EMAIL_HOOK_SECRET")
    const receivedSecret = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "")
    if (!expectedSecret || !receivedSecret || receivedSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders })
    }

    const payload = await req.json()
    const emailData = payload.email_data ?? {}
    const action = String(emailData.email_action_type ?? "")
    const recipient = String(payload.user?.email ?? emailData.email ?? "")
    const tokenHash = String(emailData.token_hash ?? "")
    if (!subjects[action] || !recipient || !tokenHash) {
      return new Response(JSON.stringify({ error: "Unsupported auth email payload" }), { status: 400, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const admin = createClient(supabaseUrl, serviceRoleKey)
    const from = await getIntegrationSetting(admin, "resend_from_email")
    if (!from) {
      return new Response(JSON.stringify({ error: "Resend From address is not configured" }), { status: 503, headers: corsHeaders })
    }

    const appUrl = await getIntegrationSetting(admin, "app_url") || "https://go-mploy.com"
    const redirectTo = String(emailData.redirect_to || `${appUrl}/auth`)
    const link = action === "reauthentication"
      ? undefined
      : verificationUrl(supabaseUrl, tokenHash, action, redirectTo)
    const content = action === "reauthentication"
      ? `Your verification code is ${String(emailData.token ?? "")}.`
      : "Use the secure link below to continue."

    const messageId = crypto.randomUUID()
    const { error: logError } = await admin.from("email_send_log").insert({
      message_id: messageId,
      template_name: `auth_${action}`,
      recipient_email: recipient,
      status: "pending",
    })
    if (logError) throw logError

    const { error: enqueueError } = await admin.rpc("enqueue_email", {
      queue_name: "auth_emails",
      payload: {
        message_id: messageId,
        to: recipient,
        subject: subjects[action],
        html: htmlEmail(subjects[action], content, link, action === "recovery" ? "Reset password" : "Continue"),
        text: `${content}${link ? `\n\n${link}` : ""}`,
        label: `auth_${action}`,
        idempotency_key: `auth-${action}-${recipient}-${tokenHash}`,
        queued_at: new Date().toISOString(),
      },
    })
    if (enqueueError) throw enqueueError

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Auth email hook failed"
    console.error("auth-email-hook:", message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})