import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2.57.2"
import { encryptSetting, getIntegrationSetting } from "../_shared/integration-settings.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const SETTINGS = {
  resend_api_key: { secret: true },
  resend_from_email: { secret: false },
  stripe_secret_key: { secret: true },
  paystack_secret_key: { secret: true },
  recaptcha_secret_key: { secret: true },
  ai_provider: { secret: false },
  openai_api_key: { secret: true },
  openai_model: { secret: false },
  gemini_api_key: { secret: true },
  gemini_model: { secret: false },
  google_client_id: { secret: false },
  google_client_secret: { secret: true },
  google_allowed_origins: { secret: false },
  app_url: { secret: false },
} as const

type SettingKey = keyof typeof SETTINGS

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })

const isSettingKey = (value: unknown): value is SettingKey =>
  typeof value === "string" && value in SETTINGS

async function resendEmail(apiKey: string, from: string, to: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "M-Ploy email configuration test",
      html: "<p>Your Resend integration is connected to M-Ploy.</p><p>You can now send job alerts, broadcasts, and transactional platform emails.</p>",
      text: "Your Resend integration is connected to M-Ploy. You can now send job alerts, broadcasts, and transactional platform emails.",
    }),
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Resend rejected the test email (${response.status}): ${detail.slice(0, 300)}`)
  }
}

async function testOpenAI(apiKey: string, model: string) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_output_tokens: 16,
      input: "Reply with OK.",
    }),
  })

  if (response.ok) return

  const responseBody = await response.text()
  let code = ""
  let type = ""
  try {
    const parsed = JSON.parse(responseBody)
    code = typeof parsed?.error?.code === "string" ? parsed.error.code : ""
    type = typeof parsed?.error?.type === "string" ? parsed.error.type : ""
  } catch {
    // Provider returned a non-JSON error. Use the status-based message below.
  }

  if (response.status === 429 && (code === "insufficient_quota" || type === "insufficient_quota")) {
    throw new Error("OpenAI key is saved, but its account has no available quota. Add billing or credits at OpenAI and test again.")
  }
  if (response.status === 429) {
    throw new Error("OpenAI is rate-limiting this key. Wait briefly and test again.")
  }
  if (response.status === 401 || response.status === 403) {
    throw new Error("OpenAI rejected this API key. Replace it with an active project key.")
  }
  if (response.status === 400 || response.status === 404) {
    throw new Error(`OpenAI cannot use the configured model (${model}). Save a supported model such as gpt-4o-mini.`)
  }
  throw new Error("OpenAI is currently unavailable. Try the test again shortly.")
}

async function testGemini(apiKey: string, model: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Reply with OK." }] }],
        generationConfig: { maxOutputTokens: 8 },
      }),
    },
  )
  if (response.ok) return
  const detail = await response.text()
  if (response.status === 401 || response.status === 403) {
    throw new Error("Google Gemini rejected this API key. Check its API access and restrictions.")
  }
  if (response.status === 400 || response.status === 404) {
    throw new Error(`Google Gemini cannot use the configured model (${model}). Save a supported model such as gemini-2.5-flash.`)
  }
  if (response.status === 429) {
    throw new Error("Google Gemini is rate-limiting this key or its quota is unavailable.")
  }
  console.error("Gemini test error:", response.status, detail.slice(0, 300))
  throw new Error("Google Gemini is currently unavailable. Try the test again shortly.")
}

async function testPaymentKey(provider: "Paystack" | "Stripe", apiKey: string) {
  const response = provider === "Paystack"
    ? await fetch("https://api.paystack.co/balance", { headers: { Authorization: `Bearer ${apiKey}` } })
    : await fetch("https://api.stripe.com/v1/account", { headers: { Authorization: `Bearer ${apiKey}` } })
  if (response.ok) return
  const detail = await response.text()
  console.error(`${provider} key test error:`, response.status, detail.slice(0, 300))
  if (response.status === 401 || response.status === 403) {
    throw new Error(`${provider} rejected the configured API key.`)
  }
  throw new Error(`${provider} could not be reached. Try the test again shortly.`)
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

  try {
    const url = Deno.env.get("SUPABASE_URL") ?? ""
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? ""
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "")
    if (!url || !serviceKey || !anonKey || !token) return json({ error: "Unauthorized" }, 401)

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const asUser = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: userData } = await asUser.auth.getUser()
    if (!userData.user) return json({ error: "Unauthorized" }, 401)

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userData.user.id, _role: "admin" })
    if (!isAdmin) return json({ error: "Forbidden — admin only" }, 403)

    const body = await req.json().catch(() => ({}))
    const action = body.action ?? "list"

    if (action === "list") {
      const { data, error } = await admin
        .from("integration_settings")
        .select("setting_key, encrypted_value, updated_at")
        .order("setting_key")
      if (error) throw error

      const rows = await Promise.all((data ?? []).map(async (row: { setting_key: SettingKey; encrypted_value: string | null; updated_at: string }) => {
        const metadata = SETTINGS[row.setting_key]
        const value = !metadata.secret && row.encrypted_value
          ? await getIntegrationSetting(admin, row.setting_key)
          : null
        return {
          key: row.setting_key,
          configured: Boolean(row.encrypted_value),
          updated_at: row.updated_at,
          value,
          secret: metadata.secret,
        }
      }))
      return json({ settings: rows })
    }

    if (action === "save") {
      if (!isSettingKey(body.key)) return json({ error: "Unsupported setting" }, 400)
      const value: string = typeof body.value === "string" ? body.value.trim() : ""
      if (!value || value.length > 10000) return json({ error: "Enter a valid value" }, 400)
      if (body.key === "ai_provider" && value !== "openai" && value !== "gemini") {
        return json({ error: "Choose OpenAI or Google Gemini" }, 400)
      }
      if (body.key === "google_client_id" && !/^[a-zA-Z0-9._-]+\.apps\.googleusercontent\.com$/.test(value)) {
        return json({ error: "Enter a valid Google OAuth web client ID" }, 400)
      }
      if (body.key === "google_client_secret" && value.length < 12) {
        return json({ error: "Enter a valid Google OAuth client secret" }, 400)
      }
      if (body.key === "google_allowed_origins") {
        const origins = value.split(",").map((origin: string) => origin.trim()).filter(Boolean)
        const valid = origins.length > 0 && origins.every((origin: string) => {
          try {
            const parsed = new URL(origin)
            const localHttp = parsed.protocol === "http:"
              && (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
            return parsed.origin === origin.replace(/\/$/, "") && (parsed.protocol === "https:" || localHttp)
          } catch {
            return false
          }
        })
        if (!valid) return json({ error: "Use comma-separated HTTPS origins without paths, for example https://go-mploy.com" }, 400)
      }

      const { error } = await admin.from("integration_settings").upsert({
        setting_key: body.key,
        encrypted_value: await encryptSetting(value),
        updated_by: userData.user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "setting_key" })
      if (error) throw error
      return json({ ok: true, configured: true })
    }

    if (action === "test_resend") {
      const to = typeof body.to === "string" ? body.to.trim() : ""
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return json({ error: "Enter a valid test recipient email" }, 400)
      const apiKey = await getIntegrationSetting(admin, "resend_api_key")
      const from = await getIntegrationSetting(admin, "resend_from_email")
      if (!apiKey || !from) return json({ error: "Save the Resend API key and From address first" }, 400)
      await resendEmail(apiKey, from, to)
      return json({ ok: true })
    }

    if (action === "test_openai" || action === "test_ai_provider") {
      const configuredProvider = await getIntegrationSetting(admin, "ai_provider")
      const provider = configuredProvider === "openai" ? "openai" : "gemini"
      if (provider === "gemini") {
        const apiKey = await getIntegrationSetting(admin, "gemini_api_key")
        const configuredModel = await getIntegrationSetting(admin, "gemini_model")
        const model = configuredModel && /^[a-zA-Z0-9._:-]{1,100}$/.test(configuredModel)
          ? configuredModel
          : "gemini-2.5-flash"
        if (!apiKey) return json({ error: "Save the Google Gemini API key first" }, 400)
        await testGemini(apiKey, model)
        return json({ ok: true, provider, model })
      }

      const apiKey = await getIntegrationSetting(admin, "openai_api_key")
      const configuredModel = await getIntegrationSetting(admin, "openai_model")
      const model = configuredModel && /^[a-zA-Z0-9._:-]{1,100}$/.test(configuredModel)
        ? configuredModel
        : "gpt-4o-mini"
      if (!apiKey) return json({ error: "Save the OpenAI API key first" }, 400)
      await testOpenAI(apiKey, model)
      return json({ ok: true, provider, model })
    }

    if (action === "test_payments") {
      const paystackKey = await getIntegrationSetting(admin, "paystack_secret_key")
      const stripeKey = await getIntegrationSetting(admin, "stripe_secret_key")
      if (!paystackKey && !stripeKey) return json({ error: "Save a Paystack or Stripe key first" }, 400)
      const checks = [
        paystackKey ? { provider: "Paystack" as const, promise: testPaymentKey("Paystack", paystackKey) } : null,
        stripeKey ? { provider: "Stripe" as const, promise: testPaymentKey("Stripe", stripeKey) } : null,
      ].filter((check): check is { provider: "Paystack" | "Stripe"; promise: Promise<void> } => Boolean(check))
      const settled = await Promise.allSettled(checks.map((check) => check.promise))
      const results = checks.map((check, index) => ({
        provider: check.provider,
        ok: settled[index].status === "fulfilled",
        error: settled[index].status === "rejected"
          ? (settled[index] as PromiseRejectedResult).reason instanceof Error
            ? (settled[index] as PromiseRejectedResult).reason.message
            : "Credential test failed"
          : null,
      }))
      const failures = results.filter((result) => !result.ok)
      if (failures.length) {
        return json({ error: failures.map((result) => `${result.provider}: ${result.error}`).join(" "), results }, 400)
      }
      return json({
        ok: true,
        providers: results.map((result) => result.provider),
        results,
      })
    }

    return json({ error: "Unsupported action" }, 400)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Settings request failed"
    console.error("admin-provider-settings error:", message)
    return json({ error: message }, 500)
  }
})
