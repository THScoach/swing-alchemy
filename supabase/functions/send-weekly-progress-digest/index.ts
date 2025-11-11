import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const since = new Date();
    since.setDate(now.getDate() - 7);

    console.log("send-weekly-progress-digest running for range", {
      from: since.toISOString(),
      to: now.toISOString(),
    });

    // Get all weekly subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("progress_email_subscriptions")
      .select("*")
      .eq("frequency", "weekly");

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch subscriptions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No weekly subscriptions found");
      return new Response(
        JSON.stringify({ success: true, message: "No weekly subscriptions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    // const Resend = resendKey ? (await import("npm:resend@2.0.0")).Resend : null;
    // const resend = resendKey ? new Resend(resendKey) : null;

    // Handle each subscription (per player)
    for (const sub of subscriptions) {
      const playerId = sub.player_id;
      if (!playerId || !sub.email) continue;

      // Player info
      const { data: player } = await supabase
        .from("players")
        .select("id, name")
        .eq("id", playerId)
        .maybeSingle();

      if (!player) continue;

      // Get analyses + scores for last 7 days
      const { data: analyses } = await supabase
        .from("video_analyses")
        .select("id, created_at")
        .eq("player_id", playerId)
        .gte("created_at", since.toISOString())
        .lte("created_at", now.toISOString())
        .order("created_at", { ascending: false });

      if (!analyses || analyses.length === 0) {
        console.log(`No analyses in last week for player ${playerId}, skipping email.`);
        continue;
      }

      const analysisIds = analyses.map((a) => a.id);

      const { data: scores } = await supabase
        .from("fourb_scores")
        .select("*")
        .in("analysis_id", analysisIds);

      if (!scores || scores.length === 0) {
        console.log(`No scores for recent analyses for player ${playerId}, skipping email.`);
        continue;
      }

      // Build simple summary: latest score + count
      const latest = scores[0];
      const summary = {
        analysesCount: analyses.length,
        latestDate: analyses[0].created_at,
        overall: latest.overall_score ? Math.round(latest.overall_score) : null,
        brain: latest.brain_score ? Math.round(latest.brain_score) : null,
        body: latest.body_score ? Math.round(latest.body_score) : null,
        bat: latest.bat_score ? Math.round(latest.bat_score) : null,
        ball: latest.ball_score ? Math.round(latest.ball_score) : null,
        focusArea: latest.focus_area || null,
        strongestArea: latest.strongest_area || null,
      };

      const analysisLinkBase = supabaseUrl.replace(".supabase.co", ".lovable.app");
      const emailPayload = {
        to: sub.email,
        subject: `Weekly 4B Progress Summary for ${player.name}`,
        html: `
          <h2>Weekly 4B Progress - ${player.name}</h2>
          <p>Analyses this week: <strong>${summary.analysesCount}</strong></p>
          <p>Latest session: ${new Date(summary.latestDate).toLocaleDateString()}</p>
          <ul>
            <li>Overall: ${summary.overall ?? "-"}</li>
            <li>Brain: ${summary.brain ?? "-"}</li>
            <li>Body: ${summary.body ?? "-"}</li>
            <li>Bat: ${summary.bat ?? "-"}</li>
            <li>Ball: ${summary.ball ?? "-"}</li>
          </ul>
          ${
            summary.focusArea
              ? `<p><strong>Focus:</strong> ${summary.focusArea}</p>`
              : ""
          }
          ${
            summary.strongestArea
              ? `<p><strong>Strength:</strong> ${summary.strongestArea}</p>`
              : ""
          }
          <p><a href="${analysisLinkBase}/players/${playerId}">View full player dashboard →</a></p>
        `,
      };

      console.log("Weekly digest email payload:", {
        to: emailPayload.to,
        subject: emailPayload.subject,
      });

      if (resendKey) {
        console.log("RESEND_API_KEY detected, would send weekly digest here");
        // await resend.emails.send({
        //   from: "The Hitting Skool <updates@yourdomain.com>",
        //   to: [emailPayload.to],
        //   subject: emailPayload.subject,
        //   html: emailPayload.html,
        // });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Weekly digests processed",
        count: subscriptions.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-weekly-progress-digest:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
