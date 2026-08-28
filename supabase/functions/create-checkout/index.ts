import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { getIntegrationSetting } from "../_shared/integration-settings.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { tier } = await req.json();
    const tiers: Record<string, { name: string; amount: number }> = {
      basic: { name: "M-Ploy Basic", amount: 99900 },
      premium: { name: "M-Ploy Premium", amount: 199900 },
    };
    const selectedTier = tiers[tier];
    if (!selectedTier) throw new Error("Invalid subscription tier");

    const settings = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const stripeKey = await getIntegrationSetting(settings, "stripe_secret_key");
    const configuredAppUrl = await getIntegrationSetting(settings, "app_url") || "https://go-mploy.com";
    if (!stripeKey) throw new Error("Stripe is not configured in Admin → Integrations");
    const appUrl = new URL(configuredAppUrl);
    if (appUrl.protocol !== "https:" && appUrl.hostname !== "localhost") throw new Error("The configured application URL must use HTTPS");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{
        price_data: {
          currency: "kes",
          unit_amount: selectedTier.amount,
          recurring: { interval: "month" },
          product_data: { name: selectedTier.name },
        },
        quantity: 1,
      }],
      mode: "subscription",
      success_url: `${appUrl.origin}/dashboard?subscription=success`,
      cancel_url: `${appUrl.origin}/dashboard?subscription=canceled`,
      metadata: { user_id: user.id, tier },
      subscription_data: { metadata: { user_id: user.id, tier } },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Checkout creation failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
