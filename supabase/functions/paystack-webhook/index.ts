import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2.57.2"
import { getIntegrationSetting } from "../_shared/integration-settings.ts"

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  })

const hex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, "0")).join("")

const safeEqual = (left: string, right: string) => {
  let mismatch = left.length === right.length ? 0 : 1
  for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return mismatch === 0
}

const MPLOY_PLANS: Record<string, "basic" | "premium"> = {
  mploy_basic_monthly_99900: "basic",
  mploy_premium_monthly_199900: "premium",
}

const eventTime = (data: Record<string, any>) => {
  for (const value of [
    data.updated_at,
    data.updatedAt,
    data.created_at,
    data.createdAt,
    data.paid_at,
    data.paidAt,
  ]) {
    const timestamp = Date.parse(String(value || ""))
    if (Number.isFinite(timestamp)) return new Date(timestamp).toISOString()
  }
  return null
}

serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
    const secret = await getIntegrationSetting(supabase, "paystack_secret_key")
    if (!secret) return json({ error: "Webhook unavailable" }, 503)

    const rawBody = await req.text()
    const signature = (req.headers.get("x-paystack-signature") || "").toLowerCase()
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"],
    )
    const expected = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)))
    if (!signature || !safeEqual(signature, expected)) return json({ error: "Invalid signature" }, 401)

    const event = JSON.parse(rawBody)
    const eventName = String(event?.event || "")
    const data = event?.data && typeof event.data === "object" ? event.data as Record<string, any> : {}
    const activating = new Set(["subscription.create", "invoice.update"])
    const deactivating = new Set(["subscription.disable", "invoice.payment_failed"])
    if (!activating.has(eventName) && !deactivating.has(eventName)) return json({ received: true })

    const email = String(data.customer?.email || data.email || "").toLowerCase()
    const customerCode = String(data.customer?.customer_code || data.customer_code || "")
    const subscriptionCode = String(data.subscription_code || data.subscription?.subscription_code || "")
    const planName = String(data.plan?.name || data.plan?.description || "").toLowerCase()
    const tier = MPLOY_PLANS[planName] || null
    const occurredAt = eventTime(data)
    const requestedUserId = typeof data.metadata?.user_id === "string" ? data.metadata.user_id : null

    if (activating.has(eventName)) {
      const successfulInvoice = eventName !== "invoice.update"
        || ["success", "successful", "active"].includes(String(data.status || "").toLowerCase())
      if (
        !successfulInvoice
        || !MPLOY_PLANS[planName]
        || !tier
        || !subscriptionCode
      ) {
        return json({ received: true, matched: false })
      }
    }
    if (!occurredAt) return json({ received: true, matched: false })

    let existing: Record<string, any> | null = null
    if (requestedUserId) {
      existing = (await supabase.from("paystack_subscribers").select("*").eq("user_id", requestedUserId).maybeSingle()).data
    }
    if (!existing && subscriptionCode) {
      existing = (await supabase.from("paystack_subscribers").select("*").eq("subscription_code", subscriptionCode).maybeSingle()).data
    }
    if (!existing && email) {
      existing = (await supabase.from("paystack_subscribers").select("*").eq("email", email).maybeSingle()).data
    }

    const userId = requestedUserId || existing?.user_id
    const subscriberEmail = email || existing?.email
    if (!userId || !subscriberEmail) {
      console.warn("paystack webhook could not match subscriber:", eventName)
      return json({ received: true, matched: false })
    }

    const isActive = activating.has(eventName)
      && !["failed", "cancelled", "disabled"].includes(String(data.status || "").toLowerCase())
    const { data: outcome, error } = await supabase.rpc("apply_paystack_webhook_event", {
      p_user_id: userId,
      p_email: subscriberEmail,
      p_status: isActive ? "active" : "inactive",
      p_tier: isActive ? tier : "free",
      p_event_at: occurredAt,
      p_subscription_code: subscriptionCode || null,
      p_customer_code: customerCode || null,
      p_email_token: data.email_token ? String(data.email_token) : null,
      p_plan_code: data.plan?.plan_code ? String(data.plan.plan_code) : null,
      p_transaction_reference: data.reference ? String(data.reference) : null,
      p_current_period_end: data.next_payment_date || null,
    })
    if (error) throw error
    return json({
      received: true,
      matched: outcome !== "unmatched",
      stale: outcome === "stale",
    })
  } catch (error) {
    console.error("paystack-webhook error:", error instanceof Error ? error.message : String(error))
    return json({ error: "Webhook processing failed" }, 500)
  }
})