import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2.57.2"
import { getIntegrationSetting } from "../_shared/integration-settings.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) throw new Error("Not authenticated")
    const { data: auth, error: authError } = await supabase.auth.getUser(token)
    if (authError || !auth.user?.email) throw new Error("Not authenticated")

    const secret = await getIntegrationSetting(supabase, "paystack_secret_key")
    if (!secret) throw new Error("Paystack is not configured in Admin → Integrations")
    const configuredAppUrl = await getIntegrationSetting(supabase, "app_url") || "https://go-mploy.com"
    const appUrl = new URL(configuredAppUrl)
    if (appUrl.protocol !== "https:" && appUrl.hostname !== "localhost") throw new Error("The configured application URL must use HTTPS")

    const init = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: auth.user.email,
        amount: 1000,
        currency: "KES",
        callback_url: `${appUrl.origin}/cv-builder?cv_payment=1`,
        metadata: { user_id: auth.user.id, purpose: "cv_export" },
      }),
    })
    const payment = await init.json()
    if (!init.ok || !payment?.status || !payment?.data?.authorization_url || !payment?.data?.reference) {
      throw new Error(`Paystack init error: ${payment?.message || "checkout unavailable"}`)
    }

    const { error: purchaseError } = await supabase.from("cv_export_purchases").insert({
      user_id: auth.user.id,
      email: auth.user.email.toLowerCase(),
      reference: payment.data.reference,
      checkout_url: payment.data.authorization_url,
      amount: 1000,
      currency: "KES",
    })
    if (purchaseError) throw purchaseError

    return new Response(JSON.stringify({ url: payment.data.authorization_url, reference: payment.data.reference }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})