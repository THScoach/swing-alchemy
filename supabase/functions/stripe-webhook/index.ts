import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Centralized email configuration
const SUPPORT_EMAIL = Deno.env.get("SUPPORT_EMAIL") || "support@4bhitting.com";
const FROM_BRAND = Deno.env.get("FROM_BRAND") || "Coach Rick @ 4B Hitting";
const FROM_ADDRESS = `${FROM_BRAND} <${SUPPORT_EMAIL}>`;
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.15";
import React from "https://esm.sh/react@18.2.0";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "https://esm.sh/@react-email/components@0.0.15";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Inline email templates
const StarterActivation = ({ firstName, profileLink, uploadLink, dashboardLink, supportEmail }: any) =>
  React.createElement(Html, null,
    React.createElement(Head, null),
    React.createElement(Preview, null, "You're activated on THS Starter ($29/mo)"),
    React.createElement(Body, { style: { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif' }},
      React.createElement(Container, { style: { margin: '0 auto', padding: '20px 0 48px', maxWidth: '600px' }},
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}, `Hi ${firstName},`),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}, "✅ You're activated on THS Starter ($29/mo)."),
        React.createElement(Heading, { style: { color: '#1a1a1a', fontSize: '18px', fontWeight: 'bold', margin: '24px 0 16px', padding: '0', lineHeight: '1.4' }}, "What you get:"),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }},
          "• Unlimited swing uploads (single angle)", React.createElement('br'),
          "• Tempo (Load:Fire) + 4B snapshot (Brain/Body/Bat/Ball)", React.createElement('br'),
          "• Coach Rick AI guidance + weekly Q&A call access (listen-in)"
        ),
        React.createElement(Heading, { style: { color: '#1a1a1a', fontSize: '18px', fontWeight: 'bold', margin: '24px 0 16px', padding: '0', lineHeight: '1.4' }}, "Next 3 minutes:"),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }},
          "1) Complete player profile → ", React.createElement(Link, { href: profileLink, style: { color: '#2754C5', textDecoration: 'underline' }}, "Profile"), React.createElement('br'),
          "2) Upload an open-face swing (≥60fps) → ", React.createElement(Link, { href: uploadLink, style: { color: '#2754C5', textDecoration: 'underline' }}, "Upload"), React.createElement('br'),
          "3) Get your report in-app → ", React.createElement(Link, { href: dashboardLink, style: { color: '#2754C5', textDecoration: 'underline' }}, "Dashboard")
        ),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }},
          React.createElement('strong', null, "Pro tip:"), " Keep the camera steady, chest-high, home plate in frame."
        ),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '26px', margin: '24px 0' }}, "— The Hitting Skool"),
        React.createElement(Text, { style: { color: '#898989', fontSize: '12px', lineHeight: '22px', marginTop: '32px', textAlign: 'center' }},
          "Support: ", React.createElement(Link, { href: `mailto:${supportEmail}`, style: { color: '#2754C5', textDecoration: 'underline' }}, supportEmail)
        )
      )
    )
  );

const HybridActivation = ({ firstName, goalsLink, uploadLink, drillsLink, supportEmail }: any) =>
  React.createElement(Html, null,
    React.createElement(Head, null),
    React.createElement(Preview, null, "Your Hybrid plan ($99/mo) is active"),
    React.createElement(Body, { style: { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif' }},
      React.createElement(Container, { style: { margin: '0 auto', padding: '20px 0 48px', maxWidth: '600px' }},
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}, `Hi ${firstName},`),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}, "🔥 Your Hybrid plan ($99/mo) is active."),
        React.createElement(Heading, { style: { color: '#1a1a1a', fontSize: '18px', fontWeight: 'bold', margin: '24px 0 16px', padding: '0', lineHeight: '1.4' }}, "You get:"),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }},
          "• Weekly personal coaching touch (DM/voice or live group)", React.createElement('br'),
          "• App-driven training plan that adapts as you improve", React.createElement('br'),
          "• Tempo + 4B deep dives with targeted drills", React.createElement('br'),
          "• Priority responses + progress tracking"
        ),
        React.createElement(Heading, { style: { color: '#1a1a1a', fontSize: '18px', fontWeight: 'bold', margin: '24px 0 16px', padding: '0', lineHeight: '1.4' }}, "Start now (2 mins):"),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }},
          "1) Set your training goal → ", React.createElement(Link, { href: goalsLink, style: { color: '#2754C5', textDecoration: 'underline' }}, "Goals"), React.createElement('br'),
          "2) Upload 2–3 swings (≥60fps) → ", React.createElement(Link, { href: uploadLink, style: { color: '#2754C5', textDecoration: 'underline' }}, "Upload"), React.createElement('br'),
          "3) See your assigned drills → ", React.createElement(Link, { href: drillsLink, style: { color: '#2754C5', textDecoration: 'underline' }}, "Drills")
        ),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }},
          React.createElement('strong', null, "First checkpoint:"), " You'll receive your plan update within 48 hours of your first upload."
        ),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}, "Let's go."),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '26px', margin: '24px 0' }}, "— Coach Rick"),
        React.createElement(Text, { style: { color: '#898989', fontSize: '12px', lineHeight: '22px', marginTop: '32px', textAlign: 'center' }},
          "Support: ", React.createElement(Link, { href: `mailto:${supportEmail}`, style: { color: '#2754C5', textDecoration: 'underline' }}, supportEmail)
        )
      )
    )
  );

const WinterActivation = ({ firstName, profileLink, uploadLink, scheduleLink }: any) =>
  React.createElement(Html, null,
    React.createElement(Head, null),
    React.createElement(Preview, null, "Winter Program confirmed — Let's build this"),
    React.createElement(Body, { style: { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif' }},
      React.createElement(Container, { style: { margin: '0 auto', padding: '20px 0 48px', maxWidth: '580px' }},
        React.createElement(Heading, { style: { color: '#333', fontSize: '24px', fontWeight: '600', lineHeight: '1.3', margin: '0 0 20px' }}, `Hi ${firstName},`),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 16px' }}, "❄️ Winter Program confirmed — $997 one-time."),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 16px', fontWeight: 'bold' }}, "What's included:"),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 8px', paddingLeft: '8px' }}, "• Full winter access to THS Analyzer + evolving drill plan"),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 8px', paddingLeft: '8px' }}, "• Weekly live group session + office hours"),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 8px', paddingLeft: '8px' }}, "• Benchmarks: Tempo ratio, 4B scores, and model comparisons"),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '24px 0 0', fontWeight: 'bold' }}, "Kickoff checklist (10 mins):"),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 8px', paddingLeft: '8px' }},
          "1) Complete player bio (level, handedness, height/weight) → ", React.createElement(Link, { href: profileLink, style: { color: '#2754C5', textDecoration: 'underline' }}, "Profile")
        ),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 8px', paddingLeft: '8px' }},
          "2) Upload 3–5 swings (≥120–240fps preferred) → ", React.createElement(Link, { href: uploadLink, style: { color: '#2754C5', textDecoration: 'underline' }}, "Upload")
        ),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 8px', paddingLeft: '8px' }},
          "3) Pick your weekly session time → ", React.createElement(Link, { href: scheduleLink, style: { color: '#2754C5', textDecoration: 'underline' }}, "Schedule")
        ),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 16px' }},
          "We'll post your first winter report within 72 hours of uploads. If you want to keep access year-round after winter, the $99/mo Hybrid is the move—we'll remind you later."
        ),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '24px 0 0', fontWeight: '500' }}, "Let's build this.", React.createElement('br'), "— Coach Rick")
      )
    )
  );

const TeamActivation = ({ coachName, seats, teamRosterLink, teamUploadLink, teamDashboardLink, supportEmail }: any) =>
  React.createElement(Html, null,
    React.createElement(Head, null),
    React.createElement(Preview, null, "Your Team plan is live — Get started now"),
    React.createElement(Body, { style: { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif' }},
      React.createElement(Container, { style: { margin: '0 auto', padding: '20px 0 48px', maxWidth: '580px' }},
        React.createElement(Heading, { style: { color: '#333', fontSize: '24px', fontWeight: '600', lineHeight: '1.3', margin: '0 0 20px' }}, `Coach ${coachName},`),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 16px' }}, `Your Team plan is live (${seats} seats).`),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 16px', fontWeight: 'bold' }}, "Do this now:"),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 8px', paddingLeft: '8px' }},
          "1) Add roster (CSV or manual) → ", React.createElement(Link, { href: teamRosterLink, style: { color: '#2754C5', textDecoration: 'underline' }}, "Team Roster")
        ),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 8px', paddingLeft: '8px' }},
          "2) Share player upload link → ", React.createElement(Link, { href: teamUploadLink, style: { color: '#2754C5', textDecoration: 'underline' }}, "Upload Link")
        ),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 8px', paddingLeft: '8px' }},
          "3) See team dashboard → ", React.createElement(Link, { href: teamDashboardLink, style: { color: '#2754C5', textDecoration: 'underline' }}, "Dashboard")
        ),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0 0 16px' }},
          "We'll auto-assign drills once first swings arrive."
        ),
        React.createElement(Text, { style: { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '24px 0 0', fontWeight: '500' }}, `— THS Support (${supportEmail})`)
      )
    )
  );

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
    } else if (planCode === "winter") {
      await sendWinterActivation(userId, session.customer_details.email, session.customer_details.phone, supabase);
    } else if (planCode === "hybrid") {
      await sendHybridActivation(userId, session.customer_details.email, supabase);
    } else if (planCode?.startsWith("team")) {
      await sendTeamActivation(userId, session.customer_details.email, session.customer_details.phone, seats, supabase);
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
      supportEmail: SUPPORT_EMAIL,
    })
  );

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: [email],
    subject: "You're activated on THS Starter ($29/mo)",
    html,
    reply_to: [SUPPORT_EMAIL],
  });

  if (phone) {
    const message = `THS: Starter is live 🎉 Next: complete your profile & upload a swing.\nProfile: ${appOrigin}/profile | Upload: ${appOrigin}/analyze\nTxt HELP for help, STOP to opt out.`;
    await sendSMS(phone, message);
  }
}

async function sendWinterActivation(
  userId: string,
  email: string,
  phone: string | null | undefined,
  supabase: any
) {
  logStep("Sending Winter activation", { userId, email });

  const { data: profile } = await supabase.from("profiles").select("name").eq("id", userId).single();
  const firstName = profile?.name?.split(" ")[0] || "there";
  const appOrigin = "https://app.thehittingskool.com";

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  const html = await renderAsync(
    React.createElement(WinterActivation, {
      firstName,
      profileLink: `${appOrigin}/profile`,
      uploadLink: `${appOrigin}/analyze`,
      scheduleLink: `${appOrigin}/calendar`,
    })
  );

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: [email],
    subject: "❄️ Winter Program Confirmed — Let's Build This",
    html,
    reply_to: [SUPPORT_EMAIL],
  });

  if (phone) {
    const message = `❄️ Winter Program confirmed! Complete your kickoff checklist: ${appOrigin}/profile`;
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
      supportEmail: SUPPORT_EMAIL,
    })
  );

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: [email],
    subject: "Your Hybrid plan ($99/mo) is active",
    html,
    reply_to: [SUPPORT_EMAIL],
  });
}

async function sendTeamActivation(
  userId: string,
  email: string,
  phone: string | null | undefined,
  seats: number,
  supabase: any
) {
  logStep("Sending Team activation", { userId, email, seats });

  const { data: profile } = await supabase.from("profiles").select("name").eq("id", userId).single();
  const coachName = profile?.name || "Coach";
  const appOrigin = "https://app.thehittingskool.com";

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  const html = await renderAsync(
    React.createElement(TeamActivation, {
      coachName,
      seats,
      teamRosterLink: `${appOrigin}/admin/teams`,
      teamUploadLink: `${appOrigin}/analyze`,
      teamDashboardLink: `${appOrigin}/admin/teams`,
      supportEmail: SUPPORT_EMAIL,
    })
  );

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: [email],
    subject: "Your Team plan is live — Get started now",
    html,
    reply_to: [SUPPORT_EMAIL],
  });

  if (phone) {
    const message = `THS: Team plan live. Add roster & share upload link.\nRoster: ${appOrigin}/admin/teams | Upload: ${appOrigin}/analyze\nTxt HELP for help, STOP to opt out.`;
    await sendSMS(phone, message);
  }
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
