import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisId } = await req.json();
    
    if (!analysisId) {
      return new Response(JSON.stringify({ error: 'analysisId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the video analysis record
    const { data: analysis, error: fetchError } = await supabase
      .from('video_analyses')
      .select('*, players(*)')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      console.error('Error fetching analysis:', fetchError);
      return new Response(JSON.stringify({ error: 'Analysis not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (analysis.processing_status === 'completed') {
      return new Response(JSON.stringify({ message: 'Analysis already completed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing video analysis for player:', analysis.player_id);

    // Get player level for scoring adjustments
    type PlayerLevel = 'Youth (10-13)' | 'HS (14-18)' | 'College' | 'Pro' | 'Other';
    const playerLevel: PlayerLevel = (analysis.players?.player_level as PlayerLevel) || 'Other';
    
    // Level-based target adjustments
    const levelMultipliers: Record<PlayerLevel, number> = {
      'Youth (10-13)': 0.70,
      'HS (14-18)': 0.80,
      'College': 0.90,
      'Pro': 1.0,
      'Other': 0.75,
    };
    const multiplier = levelMultipliers[playerLevel];

    // Generate Brain Data (S2 Cognition simulation)
    const brainData = {
      player_id: analysis.player_id,
      analysis_id: analysisId,
      processing_speed: Math.round(50 + Math.random() * 40), // 50-90 percentile
      tracking_focus: Math.round(45 + Math.random() * 45), // 45-90 percentile
      impulse_control: Math.round(40 + Math.random() * 50), // 40-90 percentile
      decision_making: Math.round(50 + Math.random() * 40), // 50-90 percentile
      overall_percentile: Math.round(45 + Math.random() * 45), // 45-90 percentile
    };

    // Generate Body Data (Reboot Motion simulation with extended COM metrics)
    const comNegativeMove = Math.round((25 + Math.random() * 20) * 100) / 100; // 25-45%
    const comFootDown = Math.round((35 + Math.random() * 20) * 100) / 100; // 35-55%
    const comMaxForward = Math.round((50 + Math.random() * 20) * 100) / 100; // 50-70%
    
    const bodyData = {
      player_id: analysis.player_id,
      analysis_id: analysisId,
      com_forward_movement_pct: comMaxForward, // Use max forward as legacy metric
      com_negative_move_pct: comNegativeMove,
      com_foot_down_pct: comFootDown,
      com_max_forward_pct: comMaxForward,
      spine_stability_score: Math.round((65 + Math.random() * 30) * 100) / 100, // 65-95
      spine_angle_var_deg: Math.round((3 + Math.random() * 12) * 100) / 100, // 3-15°
      head_movement_inches: Math.round((2 + Math.random() * 8) * 100) / 100, // 2-10 inches
      sequence_correct: Math.random() > 0.3, // 70% chance of correct sequence
      contact_time: analysis.contact_time_ms,
      back_leg_lift_time: analysis.contact_time_ms ? analysis.contact_time_ms * 0.6 : null,
    };

    // Generate Bat Data (Blast Motion simulation)
    const batSpeedTargets: Record<PlayerLevel, number> = {
      'Youth (10-13)': 55,
      'HS (14-18)': 68,
      'College': 73,
      'Pro': 78,
      'Other': 65,
    };
    const baseBatSpeed = batSpeedTargets[playerLevel];

    const batData = {
      player_id: analysis.player_id,
      analysis_id: analysisId,
      avg_bat_speed: Math.round((baseBatSpeed - 5 + Math.random() * 15) * 10) / 10, // +/- 5-10 mph
      bat_speed_sd: Math.round((2 + Math.random() * 4) * 10) / 10, // 2-6 mph SD
      attack_angle_avg: Math.round((8 + Math.random() * 12) * 10) / 10, // 8-20°
      attack_angle_sd: Math.round((3 + Math.random() * 4) * 10) / 10, // 3-7° SD
      time_in_zone_ms: Math.round(80 + Math.random() * 60), // 80-140ms
    };

    // Generate Ball Data (TrackMan/HitTrax simulation)
    const ev90Targets: Record<PlayerLevel, number> = {
      'Youth (10-13)': 70,
      'HS (14-18)': 87,
      'College': 97,
      'Pro': 102,
      'Other': 85,
    };
    const baseEV90 = ev90Targets[playerLevel];

    // Generate sample EVs and LAs
    const exitVelocities = Array.from({ length: 10 }, () => 
      Math.round((baseEV90 - 10 + Math.random() * 20) * 10) / 10
    );
    const launchAngles = Array.from({ length: 10 }, () => 
      Math.round((-5 + Math.random() * 40) * 10) / 10
    );

    const ev90 = exitVelocities.sort((a, b) => b - a)[1]; // 90th percentile
    const la90 = launchAngles.sort((a, b) => b - a)[1];
    const laSD = Math.round(Math.sqrt(
      launchAngles.reduce((sum, val) => sum + Math.pow(val - (launchAngles.reduce((a, b) => a + b) / launchAngles.length), 2), 0) / launchAngles.length
    ) * 10) / 10;

    // Calculate barrel-like rate (EV >= 90% of EV90 and LA 10-30°)
    const barrelCount = exitVelocities.filter((ev, i) => 
      ev >= ev90 * 0.9 && launchAngles[i] >= 10 && launchAngles[i] <= 30
    ).length;

    const ballData = {
      player_id: analysis.player_id,
      analysis_id: analysisId,
      ev90: ev90,
      la90: la90,
      la_sd: laSD,
      exit_velocities: exitVelocities,
      launch_angles: launchAngles,
      barrel_like_rate: Math.round((barrelCount / 10) * 100),
      hard_hit_rate: Math.round((exitVelocities.filter(ev => ev >= baseEV90 * 0.85).length / 10) * 100),
    };

    // Insert all 4B data
    const [brainInsert, bodyInsert, batInsert, ballInsert] = await Promise.all([
      supabase.from('brain_data').insert(brainData),
      supabase.from('body_data').insert(bodyData),
      supabase.from('bat_data').insert(batData),
      supabase.from('ball_data').insert(ballData),
    ]);

    if (brainInsert.error || bodyInsert.error || batInsert.error || ballInsert.error) {
      console.error('Error inserting 4B data:', { brainInsert, bodyInsert, batInsert, ballInsert });
      return new Response(JSON.stringify({ error: 'Failed to insert biomechanics data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate summary scores for video_analyses table
    const brainScore = Math.round(brainData.overall_percentile * 1.1); // Scale to ~50-100
    const bodyScore = Math.round(85 - (bodyData.com_forward_movement_pct * 0.5) - (bodyData.spine_angle_var_deg * 2) + (bodyData.spine_stability_score * 0.2));
    const batScore = Math.round((batData.avg_bat_speed / baseBatSpeed) * 85 + 10); // Scale relative to level
    const ballScore = Math.round((ballData.ev90 / baseEV90) * 85 + 10); // Scale relative to level

    // Update video_analyses with completion status and scores
    const { error: updateError } = await supabase
      .from('video_analyses')
      .update({
        processing_status: 'completed',
        brain_scores: Math.min(100, Math.max(0, brainScore)),
        body_scores: Math.min(100, Math.max(0, bodyScore)),
        bat_scores: Math.min(100, Math.max(0, batScore)),
        ball_scores: Math.min(100, Math.max(0, ballScore)),
      })
      .eq('id', analysisId);

    if (updateError) {
      console.error('Error updating analysis status:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update analysis status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully processed video analysis:', analysisId);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Video analysis completed',
      scores: { brainScore, bodyScore, batScore, ballScore }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-video-analysis:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
