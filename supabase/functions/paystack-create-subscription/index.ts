import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { getIntegrationSetting } from "../_shared/integration-settings.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tier → amount in KES kobo (Paystack uses subunits)
const TIERS: Record<string, { name: string; amount: number; interval: "monthly" }> = {
  basic: { name: "M-Ploy Basic", amount: 99900, interval: "monthly" },   // KES 999
  premium: { name: "M-Ploy Premium", amount: 199900, interval: "monthly" }, // KES 1999
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const paystackKey = await getIntegrationSetting(supabase, "paystack_secret_key");
    if (!paystackKey) throw new Error("Paystack is not configured in Admin → Integrations");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user?.email) throw new Error("Not authenticated");
    const user = userData.user;

    const { tier } = await req.json();
    const t = TIERS[tier];
    if (!t) throw new Error("Invalid tier");

    const configuredAppUrl = await getIntegrationSetting(supabase, "app_url") || "https://go-mploy.com";
    const appUrl = new URL(configuredAppUrl);
    if (appUrl.protocol !== "https:" && appUrl.hostname !== "localhost") {
      throw new Error("The configured application URL must use HTTPS");
    }
    const origin = appUrl.origin;

    // Find or create plan on Paystack (plan_code is required for recurring monthly)
    const planKey = `mploy_${tier}_monthly_${t.amount}`;
    let planCode: string | null = null;

    const plansRes = await fetch(`https://api.paystack.co/plan?per_page=100`, {
      headers: { Authorization: `Bearer ${paystackKey}` },
    });
    const plansJson = await plansRes.json();
    if (!plansRes.ok || !plansJson.status) throw new Error("Paystack could not load subscription plans");
    const existing = plansJson?.data?.find((p: any) => p.name === planKey);
    if (existing) {
      planCode = existing.plan_code;
    } else {
      const createPlan = await fetch("https://api.paystack.co/plan", {
        method: "POST",
        headers: { Authorization: `Bearer ${paystackKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planKey,
          description: t.name,
          amount: t.amount,
          interval: t.interval,
          currency: "KES",
        }),
      });
      const planJson = await createPlan.json();
      if (!planJson.status) throw new Error(`Paystack plan error: ${planJson.message}`);
      planCode = planJson.data.plan_code;
    }

    // Initialize transaction with the plan → first charge + auto-recurring subscription
    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${paystackKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        amount: t.amount,
        plan: planCode,
        currency: "KES",
        // No `channels` override: Paystack then renders EVERY channel enabled on
        // the account (M-Pesa STK, M-Pesa Till/Paybill, Airtel Money, Visa /
        // Mastercard / Amex / Verve cards, bank transfer, USSD, QR, Apple Pay).
        // Hard-coding the list hides any channel not yet activated.
        callback_url: `${origin}/dashboard?paystack=success&tier=${tier}`,
        metadata: { user_id: user.id, tier },
      }),
    });
    const initJson = await initRes.json();
    if (!initRes.ok || !initJson.status || !initJson.data?.authorization_url) {
      throw new Error(`Paystack init error: ${initJson.message || "checkout unavailable"}`);
    }

    // This atomic RPC never overwrites an active paid state with pending.
    const { error: pendingError } = await supabase.rpc("initialize_paystack_checkout", {
      p_user_id: user.id,
      p_email: user.email,
      p_plan_code: planCode,
      p_transaction_reference: initJson.data.reference,
      p_tier: tier,
    });
    if (pendingError) throw pendingError;

    return new Response(JSON.stringify({ url: initJson.data.authorization_url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
