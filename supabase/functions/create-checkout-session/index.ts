import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_PRICE_MAP: Record<string, { priceId: string; isRecurring: boolean }> = {
  starter: { priceId: Deno.env.get("STRIPE_PRICE_ID_STARTER") || "", isRecurring: true },
  hybrid: { priceId: Deno.env.get("STRIPE_PRICE_ID_HYBRID") || "", isRecurring: true },
  winter: { priceId: Deno.env.get("STRIPE_PRICE_ID_WINTER") || "", isRecurring: false },
  team10: { priceId: Deno.env.get("STRIPE_PRICE_ID_TEAM10") || "", isRecurring: true },
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT-SESSION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const {
      plan_code,
      seats,
      user_id,
      org_id,
      success_url,
      cancel_url,
      coupon_code,
    } = await req.json();

    logStep("Request payload received", { plan_code, seats, user_id, org_id });

    if (!plan_code || !PLAN_PRICE_MAP[plan_code]) {
      throw new Error(`Invalid plan_code: ${plan_code}`);
    }

    const { priceId, isRecurring } = PLAN_PRICE_MAP[plan_code];
    if (!priceId) {
      throw new Error(`Price ID not configured for plan: ${plan_code}`);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get user info if user_id provided
    let userEmail: string | undefined;
    if (user_id) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      userEmail = user?.email;
      logStep("User found", { email: userEmail });
    }

    // Check for existing Stripe customer
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing customer found", { customerId });
      }
    }

    // Build checkout session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price: priceId,
          quantity: seats || 1,
        },
      ],
      mode: isRecurring ? "subscription" : "payment",
      success_url: success_url || `${req.headers.get("origin")}/thank-you?plan=${plan_code}`,
      cancel_url: cancel_url || `${req.headers.get("origin")}/pricing`,
      metadata: {
        plan_code,
        user_id: user_id || "",
        org_id: org_id || "",
        seats: seats?.toString() || "1",
      },
      allow_promotion_codes: true,
    };

    // Apply coupon if provided
    if (coupon_code) {
      sessionParams.discounts = [{ coupon: coupon_code }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
