import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper for logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Price mapping for team plans
const TEAM_PRICE_MAP: Record<string, { priceId: string; durationDays: number }> = {
  "3m": { priceId: "price_1SSi95BleqUssXcsjJjMLySz", durationDays: 90 },
  "4m": { priceId: "price_1SSi9gBleqUssXcs4KduJvQ1", durationDays: 120 },
  "6m": { priceId: "price_1SSiAbBleqUssXcsVJcq8TsU", durationDays: 180 },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey); // Use account default API version
    logStep("Stripe initialized");

    // Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User email not found");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { plan, orgName } = await req.json();
    if (!plan || !TEAM_PRICE_MAP[plan]) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    const { priceId, durationDays } = TEAM_PRICE_MAP[plan];
    logStep("Plan selected", { plan, priceId, durationDays });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Get app URL for redirects
    const appUrl = req.headers.get("origin") || Deno.env.get("APP_URL") || "http://localhost:8080";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      automatic_payment_methods: { enabled: true }, // Enables BNPL when available
      success_url: `${appUrl}/thank-you?plan=${plan}&type=team&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/order-team`,
      metadata: {
        plan_type: "team",
        plan_code: plan,
        duration_days: durationDays.toString(),
        player_limit: "10",
        user_id: user.id,
        org_name: orgName || "",
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
