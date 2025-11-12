import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.15";
import * as React from "https://esm.sh/react@18.2.0";
import { StarterActivation } from "../send-hybrid-email/_templates/starter-activation.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No signature provided");
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Event verified", { type: event.type });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id });

        const metadata = session.metadata || {};
        const planCode = metadata.plan_code;
        const userId = metadata.user_id;
        const orgId = metadata.org_id;
        const seats = parseInt(metadata.seats || "1");

        if (!planCode) {
          logStep("No plan code in metadata");
          break;
        }

        // Get customer info
        const customerId = session.customer as string;
        
        // For subscriptions, get subscription details
        if (session.mode === "subscription") {
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          // Upsert subscription record
          const { error: subError } = await supabase
            .from("subscriptions")
            .upsert({
              user_id: userId || null,
              org_id: orgId || null,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan_code: planCode,
              status: subscription.status,
              seats: seats,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            }, {
              onConflict: "stripe_subscription_id"
            });

          if (subError) {
            logStep("Error upserting subscription", { error: subError });
          } else {
            logStep("Subscription upserted successfully");
          }

          // Update profile with stripe_customer_id
          if (userId) {
            await supabase
              .from("profiles")
              .update({ stripe_customer_id: customerId })
              .eq("id", userId);
          }

          // Handle winter access for organizations
          if (planCode === "winter" && orgId) {
            await supabase
              .from("organizations")
              .update({ winter_access: true })
              .eq("id", orgId);
          }

          // Send activation email and SMS for starter plan
          if (planCode === "starter" && userId) {
            // Get user details
            const { data: profile } = await supabase
              .from("profiles")
              .select("name, phone")
              .eq("id", userId)
              .single();

            const { data: { user } } = await supabase.auth.admin.getUserById(userId);

            if (user && profile) {
              const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
              const originUrl = Deno.env.get("SUPABASE_URL")?.replace('//', '//app.') || '';
              
              // Send activation email
              const emailHtml = await renderAsync(
                React.createElement(StarterActivation, {
                  firstName: profile.name?.split(" ")[0] || "there",
                  profileLink: `${originUrl}/profile`,
                  uploadLink: `${originUrl}/analyze`,
                  dashboardLink: `${originUrl}/my-progress`,
                  supportEmail: "support@thehittingskool.com"
                })
              );

              await resend.emails.send({
                from: "The Hitting Skool <support@thehittingskool.com>",
                to: [user.email!],
                subject: "Welcome to THS Starter — You're Activated! 🎉",
                html: emailHtml,
              });

              logStep("Starter activation email sent", { userId });

              // Send activation SMS
              if (profile.phone) {
                await supabase.functions.invoke("send-booking-sms", {
                  body: {
                    to: profile.phone,
                    message: `THS: Starter is live 🎉 Next: complete your profile & upload a swing.\nProfile: ${originUrl}/profile | Upload: ${originUrl}/analyze\nTxt HELP for help, STOP to opt out.`
                  }
                });

                logStep("Starter activation SMS sent", { userId });
              }
            }
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated/deleted", { subscriptionId: subscription.id });

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          logStep("Error updating subscription", { error });
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment succeeded", { paymentIntentId: paymentIntent.id });
        
        // Update transaction status if exists
        const { error } = await supabase
          .from("transactions")
          .update({ payment_status: "paid" })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (error) {
          logStep("Error updating transaction", { error });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
