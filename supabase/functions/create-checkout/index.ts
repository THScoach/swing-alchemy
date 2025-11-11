import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  planType: string;
  sessionType: string;
  amount: number;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  playerId?: string;
  scheduledDate?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[CREATE-CHECKOUT] Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user (optional for guest checkouts)
    const authHeader = req.headers.get("Authorization");
    let user = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
    }

    const {
      planType,
      sessionType,
      amount,
      playerName,
      playerEmail,
      playerPhone,
      playerId,
      scheduledDate,
      metadata = {}
    }: CheckoutRequest = await req.json();

    console.log("[CREATE-CHECKOUT] Request:", { planType, sessionType, amount, playerEmail });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: playerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("[CREATE-CHECKOUT] Existing customer found:", customerId);
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from("transactions")
      .insert({
        user_id: user?.id || null,
        player_id: playerId || null,
        plan_type: planType,
        session_type: sessionType,
        amount: amount,
        payment_status: "pending",
        customer_name: playerName,
        customer_email: playerEmail,
        customer_phone: playerPhone,
        scheduled_date: scheduledDate || null,
        metadata: metadata,
      })
      .select()
      .single();

    if (transactionError) {
      console.error("[CREATE-CHECKOUT] Transaction creation error:", transactionError);
      throw new Error(`Failed to create transaction: ${transactionError.message}`);
    }

    console.log("[CREATE-CHECKOUT] Transaction created:", transaction.id);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : playerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${sessionType} Session - ${planType}`,
              description: scheduledDate ? `Scheduled for ${new Date(scheduledDate).toLocaleDateString()}` : undefined,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/thank-you?session_id={CHECKOUT_SESSION_ID}&transaction_id=${transaction.id}`,
      cancel_url: `${req.headers.get("origin")}/facility?canceled=true`,
      metadata: {
        transaction_id: transaction.id,
        player_name: playerName,
        player_email: playerEmail,
        player_phone: playerPhone,
        session_type: sessionType,
        plan_type: planType,
      },
    });

    // Update transaction with Stripe session ID
    await supabaseClient
      .from("transactions")
      .update({ stripe_session_id: session.id })
      .eq("id", transaction.id);

    console.log("[CREATE-CHECKOUT] Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url, transactionId: transaction.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[CREATE-CHECKOUT] ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
