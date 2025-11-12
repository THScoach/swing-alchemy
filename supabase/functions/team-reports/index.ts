import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[TEAM-REPORTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Get teamId from query params
    const url = new URL(req.url);
    const teamId = url.searchParams.get("teamId");
    if (!teamId) throw new Error("teamId is required");

    logStep("Request parsed", { teamId, userId: user.id });

    // Verify coach owns this team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("id", teamId)
      .eq("coach_user_id", user.id)
      .single();

    if (teamError || !team) {
      throw new Error("Team not found or access denied");
    }

    // Get active team members
    const { data: members, error: membersError } = await supabase
      .from("team_members")
      .select("player_user_id, player_name, player_email")
      .eq("team_id", teamId)
      .eq("status", "active");

    if (membersError || !members || members.length === 0) {
      return new Response(
        JSON.stringify({ reports: [] }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    logStep("Members found", { count: members.length });

    // Get player IDs from members
    const playerUserIds = members.map(m => m.player_user_id).filter(Boolean);

    // Fetch players table data
    const { data: players } = await supabase
      .from("players")
      .select("id, profile_id, name")
      .in("profile_id", playerUserIds);

    const playerIdMap = new Map(players?.map(p => [p.profile_id, p.id]) || []);

    // Build reports for each member
    const reports = await Promise.all(
      members.map(async (member) => {
        if (!member.player_user_id) {
          return {
            player_name: member.player_name || member.player_email,
            player_email: member.player_email,
            status: "invited",
            last_upload_at: null,
            uploads_count_last_30d: 0,
            avg_overall_score: null,
            focus_area: null,
          };
        }

        const playerId = playerIdMap.get(member.player_user_id);

        if (!playerId) {
          return {
            player_name: member.player_name || member.player_email,
            player_email: member.player_email,
            status: "no_data",
            last_upload_at: null,
            uploads_count_last_30d: 0,
            avg_overall_score: null,
            focus_area: null,
          };
        }

        // Get upload count and last upload in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentUploads } = await supabase
          .from("video_analyses")
          .select("created_at")
          .eq("player_id", playerId)
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: false });

        const uploadsCount = recentUploads?.length || 0;
        const lastUploadAt = recentUploads?.[0]?.created_at || null;

        // Get latest 4B score
        const { data: latestScore } = await supabase
          .from("fourb_scores")
          .select("overall_score, focus_area")
          .eq("player_id", playerId)
          .order("session_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          player_name: member.player_name || member.player_email,
          player_email: member.player_email,
          player_id: playerId,
          status: "active",
          last_upload_at: lastUploadAt,
          uploads_count_last_30d: uploadsCount,
          avg_overall_score: latestScore?.overall_score || null,
          focus_area: latestScore?.focus_area || null,
        };
      })
    );

    logStep("Reports generated", { count: reports.length });

    return new Response(
      JSON.stringify({ reports }),
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
