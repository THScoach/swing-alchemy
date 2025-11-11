import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { analysisId, playerId } = await req.json();

    console.log("send-progress-email invoked", { analysisId, playerId });

    // Get player info
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id, name")
      .eq("id", playerId)
      .single();

    if (playerError || !player) {
      console.error("Player not found:", playerError);
      return new Response(
        JSON.stringify({ success: false, error: "Player not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Check for active email subscriptions (instant only for now)
    const { data: subscriptions, error: subError } = await supabase
      .from("progress_email_subscriptions")
      .select("*")
      .eq("player_id", playerId)
      .eq("frequency", "instant");

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch subscriptions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No active email subscriptions for player:", playerId);
      return new Response(
        JSON.stringify({ success: true, message: "No active email subscription" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get 4B scores for this analysis
    const { data: scores, error: scoresError } = await supabase
      .from("fourb_scores")
      .select("*")
      .eq("analysis_id", analysisId)
      .maybeSingle();

    if (scoresError) {
      console.error("Error fetching scores:", scoresError);
    }

    // Get analysis details
    const { data: analysis, error: analysisError } = await supabase
      .from("video_analyses")
      .select("*")
      .eq("id", analysisId)
      .single();

    if (analysisError || !analysis) {
      console.error("Analysis not found:", analysisError);
      return new Response(
        JSON.stringify({ success: false, error: "Analysis not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Prepare email payload for each subscription
    for (const subscription of subscriptions) {
      const emailPayload = {
        to: subscription.email,
        subject: `New 4B Analysis Complete for ${player.name}`,
        playerName: player.name,
        analysisDate: new Date(analysis.created_at).toLocaleDateString(),
        scores: scores
          ? {
              overall: scores.overall_score ? Math.round(scores.overall_score) : null,
              brain: scores.brain_score ? Math.round(scores.brain_score) : null,
              body: scores.body_score ? Math.round(scores.body_score) : null,
              bat: scores.bat_score ? Math.round(scores.bat_score) : null,
              ball: scores.ball_score ? Math.round(scores.ball_score) : null,
            }
          : null,
        insights: {
          focusArea: scores?.focus_area || null,
          strongestArea: scores?.strongest_area || null,
        },
        analysisLink: `${supabaseUrl.replace(".supabase.co", ".lovable.app")}/analyze/${analysisId}`,
      };

      console.log("Email payload prepared:", emailPayload);

      // TODO: When RESEND_API_KEY is configured, send actual email via Resend
      // For now, just log the payload
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        console.log("RESEND_API_KEY detected, would send email here");
        // const Resend = (await import("npm:resend@2.0.0")).Resend;
        // const resend = new Resend(resendKey);
        // await resend.emails.send({
        //   from: "The Hitting Skool <updates@yourdomain.com>",
        //   to: [emailPayload.to],
        //   subject: emailPayload.subject,
        //   html: `<h1>New Analysis for ${emailPayload.playerName}</h1>...`
        // });
      } else {
        console.log("No RESEND_API_KEY - email payload logged only");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Progress email prepared for ${subscriptions.length} recipient(s)`,
        subscriptionCount: subscriptions.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-progress-email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
