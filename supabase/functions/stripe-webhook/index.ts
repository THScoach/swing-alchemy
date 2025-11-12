import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.15";
import React from "https://esm.sh/react@18.2.0";
import { StarterActivation } from "../send-hybrid-email/_templates/starter-activation.tsx";
import { HybridActivation } from "../send-hybrid-email/_templates/hybrid-activation.tsx";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    logStep("ERROR", { message: "Missing signature or webhook secret" });
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    logStep("Event received", { type: event.type, id: event.id });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, supabaseClient);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription, supabaseClient);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent, supabaseClient);
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    logStep("ERROR", { message: err.message });
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  logStep("Handling checkout.session.completed", { sessionId: session.id });

  const metadata = session.metadata || {};
  const planCode = metadata.plan_code;
  const userId = metadata.user_id;
  const orgId = metadata.org_id;
  const seats = parseInt(metadata.seats || "1");

  if (!planCode) {
    logStep("ERROR", { message: "Missing plan_code in metadata" });
    return;
  }

  const { error: subError } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: userId || null,
      org_id: orgId || null,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      plan_code: planCode,
      status: "active",
      seats: seats,
      current_period_start: new Date().toISOString(),
      current_period_end: session.subscription
        ? undefined
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, {
      onConflict: "stripe_subscription_id",
    });

  if (subError) {
    logStep("ERROR upserting subscription", { error: subError });
  } else {
    logStep("Subscription upserted successfully");
  }

  if (planCode === "winter" && orgId) {
    const { error: orgError } = await supabase
      .from("organizations")
      .update({ winter_access: true })
      .eq("id", orgId);

    if (orgError) {
      logStep("ERROR updating org winter_access", { error: orgError });
    }
  }

  if (userId && session.customer_details?.email) {
    if (planCode === "starter") {
      await sendStarterActivation(userId, session.customer_details.email, session.customer_details.phone, supabase);
    } else if (planCode === "hybrid") {
      await sendHybridActivation(userId, session.customer_details.email, supabase);
    }
  }
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  supabase: any
) {
  logStep("Handling subscription change", {
    subscriptionId: subscription.id,
    status: subscription.status,
  });

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    logStep("ERROR updating subscription", { error });
  } else {
    logStep("Subscription updated successfully");
  }
}

async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  logStep("Handling payment_intent.succeeded", { paymentIntentId: paymentIntent.id });

  const { error } = await supabase
    .from("transactions")
    .update({ payment_status: "completed" })
    .eq("stripe_payment_intent_id", paymentIntent.id);

  if (error) {
    logStep("ERROR updating transaction", { error });
  }
}

async function sendStarterActivation(
  userId: string,
  email: string,
  phone: string | null | undefined,
  supabase: any
) {
  logStep("Sending Starter activation", { userId, email });

  const { data: profile } = await supabase.from("profiles").select("name").eq("id", userId).single();
  const firstName = profile?.name?.split(" ")[0] || "there";
  const appOrigin = "https://app.thehittingskool.com";

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  const html = await renderAsync(
    React.createElement(StarterActivation, {
      firstName,
      profileLink: `${appOrigin}/profile`,
      uploadLink: `${appOrigin}/analyze`,
      dashboardLink: `${appOrigin}/my-progress`,
      supportEmail: "support@thehittingskool.com",
    })
  );

  await resend.emails.send({
    from: "Coach Rick @ The Hitting Skool <support@thehittingskool.com>",
    to: [email],
    subject: "You're activated on THS Starter ($29/mo)",
    html,
  });

  if (phone) {
    const message = `THS: Starter is live 🎉 Next: complete your profile & upload a swing.\nProfile: ${appOrigin}/profile | Upload: ${appOrigin}/analyze\nTxt HELP for help, STOP to opt out.`;
    await sendSMS(phone, message);
  }
}

async function sendHybridActivation(
  userId: string,
  email: string,
  supabase: any
) {
  logStep("Sending Hybrid activation", { userId, email });

  const { data: profile } = await supabase.from("profiles").select("name").eq("id", userId).single();
  const firstName = profile?.name?.split(" ")[0] || "there";
  const appOrigin = "https://app.thehittingskool.com";

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  const html = await renderAsync(
    React.createElement(HybridActivation, {
      firstName,
      goalsLink: `${appOrigin}/profile`,
      uploadLink: `${appOrigin}/analyze`,
      drillsLink: `${appOrigin}/my-progress`,
      supportEmail: "support@thehittingskool.com",
    })
  );

  await resend.emails.send({
    from: "Coach Rick @ The Hitting Skool <support@thehittingskool.com>",
    to: [email],
    subject: "Your Hybrid plan ($99/mo) is active",
    html,
  });
}

async function sendSMS(phone: string, message: string) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromPhone) return;

  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
    },
    body: new URLSearchParams({ To: phone, From: fromPhone, Body: message }),
  });
}
