import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2.57.2"
import { getIntegrationSetting } from "../_shared/integration-settings.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })

const base64Url = (input: Uint8Array | string) => {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

const decodeBase64Url = (input: string) => {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=")
  const binary = atob(padded)
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)))
}

const signState = async (payload: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))))
}

const verifyState = async (state: string, secret: string) => {
  const [payload, signature] = state.split(".")
  if (!payload || !signature) return null
  const expected = await signState(payload, secret)
  if (signature.length !== expected.length) return null
  let mismatch = 0
  for (let index = 0; index < signature.length; index += 1) {
    mismatch |= signature.charCodeAt(index) ^ expected.charCodeAt(index)
  }
  if (mismatch !== 0) return null
  try {
    const parsed = JSON.parse(decodeBase64Url(payload))
    if (typeof parsed?.origin !== "string" || typeof parsed?.expires !== "number" || parsed.expires < Date.now()) return null
    return parsed as { origin: string; expires: number; nonce: string }
  } catch {
    return null
  }
}

const normalizeOrigin = (value: string) => {
  try {
    const url = new URL(value)
    const isLocalHttp = url.protocol === "http:"
      && (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    if (url.protocol !== "https:" && !isLocalHttp) return null
    return url.origin
  } catch {
    return null
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405)

  const requestUrl = new URL(req.url)
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  if (!supabaseUrl || !serviceKey) return json({ error: "Authentication service is unavailable" }, 503)

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    const [clientId, clientSecret, appUrl, configuredOrigins] = await Promise.all([
      getIntegrationSetting(admin, "google_client_id"),
      getIntegrationSetting(admin, "google_client_secret"),
      getIntegrationSetting(admin, "app_url"),
      getIntegrationSetting(admin, "google_allowed_origins"),
    ])

    if (requestUrl.searchParams.get("action") === "status") {
      return json({ configured: Boolean(clientId && clientSecret) })
    }

    if (!clientId || !clientSecret) {
      return json({ error: "Custom Google sign-in is not configured" }, 503)
    }

    const callbackUrl = `${supabaseUrl}/functions/v1/google-auth/callback`

    if (!requestUrl.pathname.endsWith("/callback")) {
      const requestedOrigin = normalizeOrigin(requestUrl.searchParams.get("redirect_origin") || "")
      const allowedOrigins = new Set(
        [
          normalizeOrigin(appUrl || ""),
          ...String(configuredOrigins || "").split(",").map((origin) => normalizeOrigin(origin.trim())),
          "https://go-mploy.com",
          "https://www.go-mploy.com",
        ].filter((origin): origin is string => Boolean(origin)),
      )

      if (!requestedOrigin || !allowedOrigins.has(requestedOrigin)) {
        return json({ error: "This application origin is not allowed for Google sign-in" }, 400)
      }

      const nonce = crypto.randomUUID()
      const statePayload = base64Url(JSON.stringify({
        origin: requestedOrigin,
        expires: Date.now() + 10 * 60 * 1000,
        nonce,
      }))
      const state = `${statePayload}.${await signState(statePayload, serviceKey)}`
      const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
      googleUrl.searchParams.set("client_id", clientId)
      googleUrl.searchParams.set("redirect_uri", callbackUrl)
      googleUrl.searchParams.set("response_type", "code")
      googleUrl.searchParams.set("scope", "openid email profile")
      googleUrl.searchParams.set("prompt", "select_account")
      googleUrl.searchParams.set("state", state)
      return new Response(null, {
        status: 302,
        headers: {
          Location: googleUrl.toString(),
          "Set-Cookie": `mploy_google_oauth_nonce=${nonce}; Path=/functions/v1/google-auth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
          "Referrer-Policy": "no-referrer",
        },
      })
    }

    const state = requestUrl.searchParams.get("state") || ""
    const verifiedState = await verifyState(state, serviceKey)
    if (!verifiedState) return json({ error: "Google sign-in request expired or is invalid" }, 400)
    const nonceCookie = (req.headers.get("Cookie") || "")
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("mploy_google_oauth_nonce="))
      ?.slice("mploy_google_oauth_nonce=".length) || ""
    let nonceMismatch = nonceCookie.length === verifiedState.nonce.length ? 0 : 1
    for (let index = 0; index < Math.min(nonceCookie.length, verifiedState.nonce.length); index += 1) {
      nonceMismatch |= nonceCookie.charCodeAt(index) ^ verifiedState.nonce.charCodeAt(index)
    }
    if (nonceMismatch !== 0) return json({ error: "Google sign-in browser verification failed" }, 400)

    const redirect = (params: Record<string, string>) => {
      const destination = new URL("/auth", verifiedState.origin)
      destination.hash = new URLSearchParams(params).toString()
      return new Response(null, {
        status: 302,
        headers: {
          Location: destination.toString(),
          "Set-Cookie": "mploy_google_oauth_nonce=; Path=/functions/v1/google-auth; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
          "Referrer-Policy": "no-referrer",
        },
      })
    }

    const providerError = requestUrl.searchParams.get("error")
    if (providerError) return redirect({ google_error: "Google sign-in was cancelled or denied." })
    const code = requestUrl.searchParams.get("code")
    if (!code) return redirect({ google_error: "Google did not return an authorization code." })

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    })
    if (!tokenResponse.ok) return redirect({ google_error: "Google could not verify this sign-in." })
    const tokens = await tokenResponse.json()
    if (typeof tokens?.access_token !== "string") return redirect({ google_error: "Google sign-in did not return a valid token." })

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (!profileResponse.ok) return redirect({ google_error: "Google profile verification failed." })
    const profile = await profileResponse.json()
    if (!profile?.email || profile.email_verified !== true) {
      return redirect({ google_error: "A verified Google email address is required." })
    }

    const linkOptions = {
      data: {
        full_name: typeof profile.name === "string" ? profile.name.slice(0, 200) : "",
        avatar_url: typeof profile.picture === "string" ? profile.picture.slice(0, 2000) : "",
        role: "job_seeker",
        auth_provider: "google",
        google_subject: typeof profile.sub === "string" ? profile.sub : "",
      },
    }

    let linkType: "magiclink" | "signup" = "magiclink"
    let linkResult = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: String(profile.email).toLowerCase(),
      options: linkOptions,
    })
    if (linkResult.error && /not found|does not exist/i.test(linkResult.error.message)) {
      linkType = "signup"
      linkResult = await admin.auth.admin.generateLink({
        type: "signup",
        email: String(profile.email).toLowerCase(),
        password: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
        options: linkOptions,
      })
    }
    if (linkResult.error || !linkResult.data?.properties?.hashed_token) {
      console.error("google-auth session link error:", linkResult.error?.message || "missing token")
      return redirect({ google_error: "M-Ploy could not create your secure session." })
    }

    return redirect({
      google_token_hash: linkResult.data.properties.hashed_token,
      google_token_type: linkType,
    })
  } catch (error) {
    console.error("google-auth error:", error instanceof Error ? error.message : String(error))
    return json({ error: "Google sign-in is temporarily unavailable" }, 500)
  }
})