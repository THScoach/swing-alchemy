import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  transactionId: string;
  recipientPhone: string;
  recipientEmail: string;
  playerName: string;
  sessionType: string;
  scheduledDate?: string;
  messageType: "confirmation" | "reminder";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[SEND-BOOKING-SMS] Function started");

    const {
      transactionId,
      recipientPhone,
      recipientEmail,
      playerName,
      sessionType,
      scheduledDate,
      messageType = "confirmation"
    }: SMSRequest = await req.json();

    console.log("[SEND-BOOKING-SMS] Request:", { recipientPhone, sessionType, messageType });

    // Get Twilio credentials
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhone) {
      throw new Error("Twilio credentials not configured");
    }

    // Format phone number (remove non-digits and add +1 if needed)
    let formattedPhone = recipientPhone.replace(/\D/g, "");
    if (formattedPhone.length === 10) {
      formattedPhone = "+1" + formattedPhone;
    } else if (formattedPhone.length === 11 && formattedPhone.startsWith("1")) {
      formattedPhone = "+" + formattedPhone;
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    // Create message based on type
    let messageBody = "";
    if (messageType === "confirmation") {
      const dateStr = scheduledDate 
        ? ` for ${new Date(scheduledDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
        : "";
      
      messageBody = `Hi ${playerName}! Your ${sessionType} session with The Hitting Skool is confirmed${dateStr}. Check your email for details and next steps. See you soon! 🎯`;
    } else if (messageType === "reminder") {
      messageBody = `Reminder: Your ${sessionType} session with The Hitting Skool is tomorrow! Don't forget to bring your equipment. See you soon! 🎯`;
    }

    console.log("[SEND-BOOKING-SMS] Sending to:", formattedPhone);

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: twilioPhone,
        Body: messageBody,
      }),
    });

    const twilioData = await twilioResponse.json();
    console.log("[SEND-BOOKING-SMS] Twilio response:", twilioData);

    if (!twilioResponse.ok) {
      throw new Error(`Twilio error: ${twilioData.message || "Unknown error"}`);
    }

    // Log communication in database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: commError } = await supabaseClient
      .from("communications")
      .insert({
        transaction_id: transactionId,
        recipient_phone: formattedPhone,
        recipient_email: recipientEmail,
        message_type: messageType,
        channel: "sms",
        message_body: messageBody,
        status: "sent",
        external_id: twilioData.sid,
        metadata: { twilio_status: twilioData.status },
      });

    if (commError) {
      console.error("[SEND-BOOKING-SMS] Communication log error:", commError);
    }

    console.log("[SEND-BOOKING-SMS] SMS sent successfully:", twilioData.sid);

    return new Response(JSON.stringify({ 
      success: true, 
      messageSid: twilioData.sid,
      status: twilioData.status 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[SEND-BOOKING-SMS] ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    // Try to log failed communication
    try {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      const body = await req.json();
      await supabaseClient
        .from("communications")
        .insert({
          transaction_id: body.transactionId,
          recipient_phone: body.recipientPhone,
          recipient_email: body.recipientEmail,
          message_type: body.messageType || "confirmation",
          channel: "sms",
          message_body: "",
          status: "failed",
          error_message: errorMessage,
        });
    } catch (logError) {
      console.error("[SEND-BOOKING-SMS] Failed to log error:", logError);
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
