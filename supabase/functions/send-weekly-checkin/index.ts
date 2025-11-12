import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[WEEKLY-CHECKIN] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, weekNumber = 1 } = await req.json();

    if (!userId) {
      throw new Error("userId is required");
    }

    logStep("Fetching user profile", { userId, weekNumber });

    // Get user profile with phone
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("name, phone")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile not found: ${profileError?.message}`);
    }

    if (!profile.phone) {
      logStep("No phone number, skipping SMS");
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "No phone number" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const firstName = profile.name?.split(" ")[0] || "there";
    const appOrigin = Deno.env.get("APP_URL") || "https://app.4bhitting.com";
    const uploadLink = `${appOrigin}/analyze`;

    // Week-specific messages
    const messages: Record<number, string> = {
      1: `Subject: Quick win check-in\nHow's week 1? If you upload 2 fresh swings today, I'll tighten your plan tonight.\nUpload → ${uploadLink}`,
      2: `Week 2 check-in: Seeing any changes in feel yet? Upload another swing to track progress.\nUpload → ${uploadLink}`,
      3: `Week 3: Let's see if the work is translating. Upload when ready.\nUpload → ${uploadLink}`,
    };

    const messageBody = messages[weekNumber] || messages[1];

    // Send SMS via Twilio
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromPhone) {
      throw new Error("Twilio credentials not configured");
    }

    logStep("Sending SMS", { to: profile.phone, weekNumber });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
        body: new URLSearchParams({
          To: profile.phone,
          From: fromPhone,
          Body: messageBody,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Twilio API error: ${JSON.stringify(result)}`);
    }

    logStep("SMS sent successfully", { sid: result.sid });

    // Log communication
    await supabaseClient.from("communications").insert({
      player_id: null,
      channel: "sms",
      message_type: `week_${weekNumber}_checkin`,
      recipient_phone: profile.phone,
      message_body: messageBody,
      status: "sent",
      external_id: result.sid,
      metadata: { user_id: userId, week_number: weekNumber },
    });

    return new Response(
      JSON.stringify({ success: true, sid: result.sid }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
