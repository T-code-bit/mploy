import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { getIntegrationSetting } from "../_shared/integration-settings.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const user = userData.user;
    if (userErr || !user || !user.email) throw new Error("Not authenticated");
    const email: string = user.email;

    // Look up Paystack customer by email
    const custRes = await fetch(
      `https://api.paystack.co/customer/${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${paystackKey}` } }
    );
    const custJson = await custRes.json();

    const customerNotFound = custRes.status === 404
      || (!custJson.status && /not found|does not exist/i.test(String(custJson.message || "")));
    if (customerNotFound) {
      // No customer yet → free
      await supabase.from("paystack_subscribers").upsert({
        user_id: user.id, email: user.email, tier: "free", status: "inactive",
      }, { onConflict: "user_id" });
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }
    if (!custRes.ok || !custJson.status || !custJson.data) {
      throw new Error(`Paystack customer lookup failed (${custRes.status})`);
    }

    const customer = custJson.data;
    const customerCode = customer.customer_code;

    // List subscriptions for this customer
    const subsRes = await fetch(
      `https://api.paystack.co/subscription?customer=${customer.id}`,
      { headers: { Authorization: `Bearer ${paystackKey}` } }
    );
    const subsJson = await subsRes.json();
    if (!subsRes.ok || !subsJson.status || !Array.isArray(subsJson.data)) {
      throw new Error(`Paystack subscription lookup failed (${subsRes.status})`);
    }
    const mployPlans: Record<string, "basic" | "premium"> = {
      mploy_basic_monthly_99900: "basic",
      mploy_premium_monthly_199900: "premium",
    };
    const active = subsJson.data.find((subscription: any) => {
      const planName = String(subscription.plan?.name || "").toLowerCase();
      return subscription.status === "active" && Boolean(mployPlans[planName]);
    });

    let tier = "free";
    let status = "inactive";
    let periodEnd: string | null = null;
    let subscriptionCode: string | null = null;
    let emailToken: string | null = null;
    let planCode: string | null = null;

    if (active) {
      status = "active";
      subscriptionCode = active.subscription_code;
      emailToken = active.email_token;
      planCode = active.plan?.plan_code;
      periodEnd = active.next_payment_date;
      const planName = String(active.plan?.name || "").toLowerCase();
      tier = mployPlans[planName];
    }

    await supabase.from("paystack_subscribers").upsert({
      user_id: user.id,
      email: user.email,
      customer_code: customerCode,
      subscription_code: subscriptionCode,
      email_token: emailToken,
      plan_code: planCode,
      tier,
      status,
      current_period_end: periodEnd,
    }, { onConflict: "user_id" });

    return new Response(JSON.stringify({
      subscribed: status === "active",
      tier,
      subscription_end: periodEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
