import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tier → amount in KES kobo (Paystack uses subunits)
const TIERS: Record<string, { name: string; amount: number; interval: "monthly" }> = {
  basic: { name: "M-Ploy Basic", amount: 1000, interval: "monthly" },   // KES 10
  premium: { name: "M-Ploy Premium", amount: 1500, interval: "monthly" }, // KES 15
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackKey) throw new Error("PAYSTACK_SECRET_KEY not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user?.email) throw new Error("Not authenticated");
    const user = userData.user;

    const { tier } = await req.json();
    const t = TIERS[tier];
    if (!t) throw new Error("Invalid tier");

    const origin = req.headers.get("origin") || "https://mploy.lovable.app";

    // Find or create plan on Paystack (plan_code is required for recurring monthly)
    const planKey = `mploy_${tier}_monthly_${t.amount}`;
    let planCode: string | null = null;

    const plansRes = await fetch(`https://api.paystack.co/plan?per_page=100`, {
      headers: { Authorization: `Bearer ${paystackKey}` },
    });
    const plansJson = await plansRes.json();
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
        // Explicitly enable all payment channels available on the Paystack account.
        // mobile_money => M-Pesa / Airtel Money STK push prompt on the customer's phone,
        // plus Paybill/Till collection. Cards: Visa/Mastercard/Amex/Verve.
        channels: ["mobile_money", "card", "bank", "bank_transfer", "ussd", "qr", "eft", "apple_pay"],
        callback_url: `${origin}/dashboard?paystack=success&tier=${tier}`,
        metadata: { user_id: user.id, tier },
      }),
    });
    const initJson = await initRes.json();
    if (!initJson.status) throw new Error(`Paystack init error: ${initJson.message}`);

    // Pre-record pending state
    await supabase.from("paystack_subscribers").upsert({
      user_id: user.id,
      email: user.email,
      plan_code: planCode,
      tier,
      status: "pending",
    }, { onConflict: "user_id" });

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
