import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2.57.2"
import { getIntegrationSetting } from "../_shared/integration-settings.ts"

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers })
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } })
    const token = req.headers.get("Authorization")?.replace("Bearer ", "")
    const { data: auth, error: authError } = token ? await supabase.auth.getUser(token) : { data: null, error: true }
    if (authError || !auth?.user) throw new Error("Not authenticated")
    const { reference } = await req.json()
    if (typeof reference !== "string" || !/^[A-Za-z0-9._-]{6,128}$/.test(reference)) throw new Error("Invalid payment reference")

    const { data: purchase, error: purchaseError } = await supabase.from("cv_export_purchases")
      .select("id, email, status").eq("reference", reference).eq("user_id", auth.user.id).maybeSingle()
    if (purchaseError || !purchase) throw new Error("Payment purchase was not found")

    const secret = await getIntegrationSetting(supabase, "paystack_secret_key")
    if (!secret) throw new Error("Paystack is not configured")
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secret}` } })
    const result = await response.json()
    const transaction = result?.data
    const metadata = typeof transaction?.metadata === "string" ? JSON.parse(transaction.metadata) : transaction?.metadata
    const valid = response.ok && result?.status && transaction?.status === "success"
      && transaction?.reference === reference && transaction?.amount === 1000 && transaction?.currency === "KES"
      && String(transaction?.customer?.email || "").toLowerCase() === purchase.email.toLowerCase()
      && metadata?.user_id === auth.user.id && metadata?.purpose === "cv_export"
    if (!valid) throw new Error("Paystack could not verify this KES 10 CV payment")

    if (purchase.status === "pending") {
      const { error } = await supabase.from("cv_export_purchases").update({
        status: "verified", provider_paid_at: transaction.paid_at || new Date().toISOString(),
      }).eq("id", purchase.id).eq("status", "pending")
      if (error) throw error
    }
    return new Response(JSON.stringify({ verified: true, exported: purchase.status === "exported" }), { headers: { ...headers, "Content-Type": "application/json" } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
  }
})