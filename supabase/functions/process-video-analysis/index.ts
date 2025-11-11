import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

// Reboot metrics types and functions (inlined for Deno edge function compatibility)
interface RebootMetrics {
  fps: number;
  com_forward_pct: number | null;
  com_score: number | null;
  head_movement_inches: number | null;
  head_movement_score: number | null;
  spine_std_deg: number | null;
  spine_score: number | null;
  sequence: {
    pelvis_frame?: number;
    torso_frame?: number;
    arm_frame?: number;
    bat_frame?: number;
    correct: boolean;
    score: number;
    details: string;
  };
  bat: {
    avg_bat_speed: number | null;
    bat_speed_score: number | null;
    attack_angle_avg: number | null;
    attack_angle_score: number | null;
    time_in_zone_ms: number | null;
    time_in_zone_score: number | null;
  };
  ball: {
    ev90: number | null;
    ev90_score: number | null;
    la90: number | null;
    la90_score: number | null;
    barrel_like_rate: number | null;
    barrel_like_score: number | null;
    hard_hit_rate: number | null;
    hard_hit_score: number | null;
  };
  aggregate: {
    body_score: number | null;
    bat_score: number | null;
    ball_score: number | null;
    overall_score: number | null;
  };
  weirdness: {
    comOutOfRange: boolean;
    excessiveHeadMovement: boolean;
    poorSpineStability: boolean;
    sequenceIncorrect: boolean;
    insufficientFrames: boolean;
  };
  weirdness_message: string;
}

interface SequencePeaks {
  pelvis_frame?: number;
  torso_frame?: number;
  arm_frame?: number;
  bat_frame?: number;
}

// Helper to compute average of non-null values
function safeAverage(values: (number | null | undefined)[]): number | null {
  const valid = values.filter((v): v is number => v != null && !isNaN(v));
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((sum, v) => sum + v, 0) / valid.length);
}

// Scoring functions with Model bands
function scoreCOM(pct: number): number {
  if (pct >= 18 && pct <= 22) return 100;
  if (pct >= 15 && pct <= 25) return 80;
  if (pct >= 10 && pct <= 30) return 60;
  return 40;
}

function scoreHead(inches: number): number {
  if (inches <= 4) return 100;
  if (inches <= 6) return 80;
  if (inches <= 10) return 60;
  return 40;
}

function scoreSpine(std: number): number {
  if (std <= 6) return 100;
  if (std <= 10) return 80;
  if (std <= 15) return 60;
  return 40;
}

function scoreBatSpeed(speed: number, level: string): number {
  const targets: Record<string, number> = {
    'MLB': 75, 'Pro': 75, 'College': 70, 'HS': 65,
    'HS (14-18)': 65, 'Youth': 55, 'Youth (10-13)': 55, 'Other': 70
  };
  const target = targets[level] || 70;
  if (speed >= target) return 100;
  if (speed >= target * 0.9) return 80;
  if (speed >= target * 0.8) return 60;
  return 40;
}

function scoreAttackAngle(angle: number): number {
  if (angle >= 8 && angle <= 20) return 100;
  if (angle >= 5 && angle <= 25) return 80;
  if (angle >= 0 && angle <= 30) return 60;
  return 40;
}

function scoreTimeInZone(ms: number): number {
  if (ms >= 150 && ms <= 200) return 100;
  if (ms >= 120 && ms <= 220) return 80;
  if (ms >= 100 && ms <= 250) return 60;
  return 40;
}

function scoreExitVelocity90(ev: number, level: string): number {
  const targets: Record<string, number> = {
    'MLB': 95, 'Pro': 95, 'College': 90, 'HS': 85,
    'HS (14-18)': 85, 'Youth': 75, 'Youth (10-13)': 75, 'Other': 90
  };
  const target = targets[level] || 90;
  if (ev >= target) return 100;
  if (ev >= target * 0.95) return 80;
  if (ev >= target * 0.9) return 60;
  return 40;
}

function scoreLaunchAngle90(la: number): number {
  if (la >= 10 && la <= 30) return 100;
  if (la >= 5 && la <= 35) return 80;
  if (la >= 0 && la <= 40) return 60;
  return 40;
}

function scoreRate(rate: number, target: number = 50): number {
  if (rate >= target) return 100;
  if (rate >= target * 0.8) return 80;
  if (rate >= target * 0.6) return 60;
  return 40;
}

function computeSequenceCorrectness(peaks: SequencePeaks | null): {
  value: boolean;
  score: number;
  details: string;
} {
  if (!peaks) {
    return { value: false, score: 70, details: 'No kinematic data' };
  }

  const { pelvis_frame, torso_frame, arm_frame, bat_frame } = peaks;
  
  if (pelvis_frame == null || torso_frame == null || arm_frame == null || bat_frame == null) {
    return { value: false, score: 70, details: 'Incomplete kinematic data' };
  }

  const correctOrder = pelvis_frame < torso_frame && torso_frame < arm_frame && arm_frame < bat_frame;
  
  if (correctOrder) {
    return { value: true, score: 100, details: '3/3 transitions correct (pelvis→torso→arm→bat)' };
  } else {
    return { value: false, score: 50, details: 'Sequence timing out of order' };
  }
}

function detectWeirdness(params: {
  comPct: number | null;
  headMovement: number | null;
  spineStd: number | null;
  sequence: SequencePeaks | undefined;
  frameCount: number | undefined;
}) {
  return {
    comOutOfRange: params.comPct != null && (params.comPct < 5 || params.comPct > 40),
    excessiveHeadMovement: params.headMovement != null && params.headMovement > 18,
    poorSpineStability: params.spineStd != null && params.spineStd > 25,
    sequenceIncorrect: params.sequence ? !computeSequenceCorrectness(params.sequence).value : false,
    insufficientFrames: params.frameCount != null && params.frameCount < 30,
  };
}

function getWeirdnessMessage(flags: {
  comOutOfRange: boolean;
  excessiveHeadMovement: boolean;
  poorSpineStability: boolean;
  sequenceIncorrect: boolean;
  insufficientFrames: boolean;
}): string {
  const messages: string[] = [];
  if (flags.comOutOfRange) messages.push('COM% out of realistic range');
  if (flags.excessiveHeadMovement) messages.push('Head movement > 18"');
  if (flags.poorSpineStability) messages.push('Spine instability > 25°');
  if (flags.sequenceIncorrect) messages.push('Kinetic sequence issues');
  if (flags.insufficientFrames) messages.push('Insufficient frame data');
  return messages.join(', ') || 'No issues detected';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisId, mode, level, handedness, fps_confirmed, source, proSwingId } = await req.json();
    
    if (!analysisId) {
      return new Response(JSON.stringify({ error: 'analysisId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For model mode, require fps_confirmed
    if (mode === 'model' && !fps_confirmed) {
      return new Response(JSON.stringify({ error: 'fps_confirmed is required for model mode' }), {
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
    console.log('Mode:', mode || analysis.mode || 'player');
    console.log('FPS Confirmed:', fps_confirmed || analysis.fps_confirmed);

    // Get player level for scoring adjustments
    type PlayerLevel = 'Youth (10-13)' | 'HS (14-18)' | 'College' | 'Pro' | 'Other';
    const playerLevel: PlayerLevel = (analysis.players?.player_level as PlayerLevel) || 'Other';
    
    // Use provided level or fall back to player level
    const effectiveLevel = level || (analysis.players?.player_level as string) || 'Other';
    const effectiveHandedness = handedness || analysis.hitter_side || analysis.players?.bats || 'R';
    // fps_confirmed (param) or analysis.fps (numeric value) - NOT analysis.fps_confirmed (boolean)
    const effectiveFps = fps_confirmed || analysis.fps || 60;
    
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

    // Determine if this is Model/Reboot mode
    const analysisMode = mode || analysis.mode || 'player';
    const isModelMode = analysisMode === 'model' || analysis.is_pro_model === true;

    // For Model mode, compute Reboot-style metrics using confirmed FPS
    let metricsReboot: RebootMetrics | null = null;
    
    if (isModelMode) {
      // Enforce confirmed FPS for model mode
      if (!effectiveFps || effectiveFps === 60) {
        console.warn('Model/Reboot mode without confirmed FPS. Using fallback but quality may be compromised.');
      }
      
      console.log('Computing Reboot metrics for model mode analysis');
      console.log(`Using FPS: ${effectiveFps}, Level: ${effectiveLevel}, Handedness: ${effectiveHandedness}`);

      // Build sequence peaks for correctness check
      const sequencePeaks: SequencePeaks = {
        pelvis_frame: 0,  // These would come from actual tracking data in production
        torso_frame: 0,
        arm_frame: 0,
        bat_frame: 0,
      };

      // Compute sequence correctness
      const sequenceResult = computeSequenceCorrectness(
        bodyData.sequence_correct ? sequencePeaks : null
      );

      // Score all metrics using Reboot bands
      const comScore = scoreCOM(bodyData.com_max_forward_pct);
      const headScore = scoreHead(bodyData.head_movement_inches);
      const spineScore = scoreSpine(bodyData.spine_angle_var_deg);
      
      const batSpeedScore = scoreBatSpeed(batData.avg_bat_speed, effectiveLevel);
      const attackAngleScore = scoreAttackAngle(batData.attack_angle_avg);
      const timeInZoneScore = scoreTimeInZone(batData.time_in_zone_ms);
      
      const ev90Score = scoreExitVelocity90(ballData.ev90, effectiveLevel);
      const la90Score = scoreLaunchAngle90(ballData.la90);
      const barrelScore = scoreRate(ballData.barrel_like_rate, 50);
      const hardHitScore = scoreRate(ballData.hard_hit_rate, 50);

      // Aggregate scores
      const bodyScore = safeAverage([comScore, headScore, spineScore, sequenceResult.score]);
      const batScore = safeAverage([batSpeedScore, attackAngleScore, timeInZoneScore]);
      const ballScore = safeAverage([ev90Score, la90Score, barrelScore, hardHitScore]);
      const overallScore = safeAverage([bodyScore, batScore, ballScore]);

      // Detect weirdness
      const weirdnessFlags = detectWeirdness({
        comPct: bodyData.com_max_forward_pct,
        headMovement: bodyData.head_movement_inches,
        spineStd: bodyData.spine_angle_var_deg,
        sequence: bodyData.sequence_correct ? sequencePeaks : undefined,
        frameCount: undefined, // Would come from actual frame data
      });

      const weirdnessMessage = getWeirdnessMessage(weirdnessFlags);

      metricsReboot = {
        fps: effectiveFps,
        com_forward_pct: bodyData.com_max_forward_pct,
        com_score: comScore,
        head_movement_inches: bodyData.head_movement_inches,
        head_movement_score: headScore,
        spine_std_deg: bodyData.spine_angle_var_deg,
        spine_score: spineScore,
        sequence: {
          ...sequencePeaks,
          correct: sequenceResult.value,
          score: sequenceResult.score,
          details: sequenceResult.details,
        },
        bat: {
          avg_bat_speed: batData.avg_bat_speed,
          bat_speed_score: batSpeedScore,
          attack_angle_avg: batData.attack_angle_avg,
          attack_angle_score: attackAngleScore,
          time_in_zone_ms: batData.time_in_zone_ms,
          time_in_zone_score: timeInZoneScore,
        },
        ball: {
          ev90: ballData.ev90,
          ev90_score: ev90Score,
          la90: ballData.la90,
          la90_score: la90Score,
          barrel_like_rate: ballData.barrel_like_rate,
          barrel_like_score: barrelScore,
          hard_hit_rate: ballData.hard_hit_rate,
          hard_hit_score: hardHitScore,
        },
        aggregate: {
          body_score: bodyScore,
          bat_score: batScore,
          ball_score: ballScore,
          overall_score: overallScore,
        },
        weirdness: weirdnessFlags,
        weirdness_message: weirdnessMessage,
      };

      console.log('Reboot metrics computed:', JSON.stringify(metricsReboot, null, 2));
    }

    // Update video_analyses with completion status and scores
    const updateData: any = {
      processing_status: 'completed',
      brain_scores: Math.min(100, Math.max(0, brainScore)),
      body_scores: Math.min(100, Math.max(0, bodyScore)),
      bat_scores: Math.min(100, Math.max(0, batScore)),
      ball_scores: Math.min(100, Math.max(0, ballScore)),
    };

    // Add model-specific fields if in model mode
    if (analysisMode === 'model') {
      updateData.mode = 'model';
      updateData.level = effectiveLevel;
      updateData.handedness = effectiveHandedness;
      updateData.fps = effectiveFps;
      updateData.fps_confirmed = true;
      updateData.is_pro_model = true;
      
      if (metricsReboot) {
        updateData.metrics_reboot = metricsReboot;
      }
    }

    const { error: updateError } = await supabase
      .from('video_analyses')
      .update(updateData)
      .eq('id', analysisId);

    if (updateError) {
      console.error('Error updating analysis status:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update analysis status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If this is from a Pro Swing upload, also update the pro_swings table
    if (source === 'pro_swing' && proSwingId && metricsReboot) {
      console.log('Updating pro_swings record:', proSwingId);
      const { error: proSwingError } = await supabase
        .from('pro_swings')
        .update({
          has_analysis: true,
          fps: effectiveFps,
          metrics_reboot: metricsReboot,
          weirdness_flags: metricsReboot.weirdness,
        })
        .eq('id', proSwingId);

      if (proSwingError) {
        console.error('Error updating pro_swings:', proSwingError);
        // Don't fail the whole request, just log it
      } else {
        console.log('Successfully updated pro_swings record');
      }
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
