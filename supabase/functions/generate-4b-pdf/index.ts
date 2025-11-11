import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
    console.log('Generating PDF for analysis:', analysisId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch analysis data
    const { data: analysis, error: analysisError } = await supabaseClient
      .from('video_analyses')
      .select('*, players(*)')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      throw new Error('Analysis not found');
    }

    // Fetch 4B scores
    const { data: fourbScore, error: scoreError } = await supabaseClient
      .from('fourb_scores')
      .select('*')
      .eq('analysis_id', analysisId)
      .maybeSingle();

    // Fetch detailed metrics
    const [brainData, bodyData, batData, ballData] = await Promise.all([
      supabaseClient.from('brain_data').select('*').eq('analysis_id', analysisId).maybeSingle(),
      supabaseClient.from('body_data').select('*').eq('analysis_id', analysisId).maybeSingle(),
      supabaseClient.from('bat_data').select('*').eq('analysis_id', analysisId).maybeSingle(),
      supabaseClient.from('ball_data').select('*').eq('analysis_id', analysisId).maybeSingle(),
    ]);

    // Generate HTML report
    const html = generateHTMLReport({
      analysis,
      fourbScore: fourbScore || {},
      brainData: brainData.data || {},
      bodyData: bodyData.data || {},
      batData: batData.data || {},
      ballData: ballData.data || {},
    });

    // Convert HTML to PDF using data URI (simple approach)
    // In production, you might want to use a proper PDF generation service
    const pdfFilename = `4b-report-${analysis.players?.name?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

    // Return HTML for now (can be enhanced with actual PDF generation)
    return new Response(
      JSON.stringify({ 
        success: true, 
        html,
        filename: pdfFilename,
        message: 'PDF content generated. Use browser print or PDF library for final conversion.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function generateHTMLReport(data: any): string {
  const { analysis, fourbScore, brainData, bodyData, batData, ballData } = data;
  const playerName = analysis.players?.name || 'Unknown Player';
  const analysisDate = new Date(analysis.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getScoreColor = (score: number | null | undefined): string => {
    if (!score) return '#666';
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>4B Swing Analysis Report - ${playerName}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
    }
    .container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 10mm;
    }
    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: #FFD700;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .header .subtitle {
      font-size: 16px;
      color: #f0f0f0;
    }
    .player-info {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 25px;
      border-left: 4px solid #FFD700;
    }
    .player-info h2 {
      color: #1a1a1a;
      margin-bottom: 15px;
      font-size: 24px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .info-value {
      color: #1a1a1a;
      font-weight: 500;
    }
    .fourb-overview {
      margin: 30px 0;
    }
    .fourb-overview h3 {
      font-size: 22px;
      margin-bottom: 20px;
      color: #1a1a1a;
    }
    .scores-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .score-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
    }
    .score-card .label {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .score-card .score {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .score-card .state {
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      display: inline-block;
      font-weight: 600;
    }
    .state-synced {
      background: #dcfce7;
      color: #16a34a;
    }
    .state-developing {
      background: #fef3c7;
      color: #ca8a04;
    }
    .state-limiting {
      background: #fee2e2;
      color: #dc2626;
    }
    .metrics-section {
      margin: 30px 0;
      page-break-inside: avoid;
    }
    .metrics-section h4 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #1a1a1a;
      border-bottom: 2px solid #FFD700;
      padding-bottom: 8px;
    }
    .metrics-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .metrics-table th {
      background: #f9fafb;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    .metrics-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .metric-value {
      font-weight: 600;
      color: #1a1a1a;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .watermark {
      position: fixed;
      bottom: 20mm;
      right: 20mm;
      opacity: 0.1;
      font-size: 48px;
      font-weight: 700;
      color: #FFD700;
      transform: rotate(-45deg);
      pointer-events: none;
    }
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="watermark">THE HITTING SKOOL</div>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>4B SWING ANALYSIS REPORT</h1>
      <div class="subtitle">The Hitting Skool 4B System</div>
    </div>

    <!-- Player Info -->
    <div class="player-info">
      <h2>${playerName}</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Analysis Date:</span>
          <span class="info-value">${analysisDate}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Analysis ID:</span>
          <span class="info-value">${analysis.id.slice(0, 8)}...</span>
        </div>
        <div class="info-item">
          <span class="info-label">Context:</span>
          <span class="info-value">${analysis.context_tag || 'N/A'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Player Level:</span>
          <span class="info-value">${analysis.players?.player_level || 'N/A'}</span>
        </div>
      </div>
    </div>

    <!-- 4B Overview -->
    <div class="fourb-overview">
      <h3>4B Performance Overview</h3>
      <div class="scores-grid">
        <div class="score-card">
          <div class="label">BRAIN</div>
          <div class="score" style="color: ${getScoreColor(fourbScore.brain_score)}">
            ${fourbScore.brain_score ? Math.round(fourbScore.brain_score) : '-'}
          </div>
          <div class="state ${fourbScore.brain_state === 'synced' ? 'state-synced' : fourbScore.brain_state === 'developing' ? 'state-developing' : 'state-limiting'}">
            ${fourbScore.brain_state || 'No Data'}
          </div>
        </div>
        <div class="score-card">
          <div class="label">BODY</div>
          <div class="score" style="color: ${getScoreColor(fourbScore.body_score)}">
            ${fourbScore.body_score ? Math.round(fourbScore.body_score) : '-'}
          </div>
          <div class="state ${fourbScore.body_state === 'synced' ? 'state-synced' : fourbScore.body_state === 'developing' ? 'state-developing' : 'state-limiting'}">
            ${fourbScore.body_state || 'No Data'}
          </div>
        </div>
        <div class="score-card">
          <div class="label">BAT</div>
          <div class="score" style="color: ${getScoreColor(fourbScore.bat_score)}">
            ${fourbScore.bat_score ? Math.round(fourbScore.bat_score) : '-'}
          </div>
          <div class="state ${fourbScore.bat_state === 'synced' ? 'state-synced' : fourbScore.bat_state === 'developing' ? 'state-developing' : 'state-limiting'}">
            ${fourbScore.bat_state || 'No Data'}
          </div>
        </div>
        <div class="score-card">
          <div class="label">BALL</div>
          <div class="score" style="color: ${getScoreColor(fourbScore.ball_score)}">
            ${fourbScore.ball_score ? Math.round(fourbScore.ball_score) : '-'}
          </div>
          <div class="state ${fourbScore.ball_state === 'synced' ? 'state-synced' : fourbScore.ball_state === 'developing' ? 'state-developing' : 'state-limiting'}">
            ${fourbScore.ball_state || 'No Data'}
          </div>
        </div>
      </div>
      ${fourbScore.overall_score ? `
      <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
        <div style="font-size: 14px; color: #666; margin-bottom: 5px;">OVERALL 4B SCORE</div>
        <div style="font-size: 64px; font-weight: 700; color: ${getScoreColor(fourbScore.overall_score)};">
          ${Math.round(fourbScore.overall_score)}
        </div>
      </div>
      ` : ''}
    </div>

    <!-- Brain Metrics -->
    ${Object.keys(brainData).length > 0 ? `
    <div class="metrics-section">
      <h4>🧠 Brain (Cognitive Performance)</h4>
      <table class="metrics-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          ${brainData.processing_speed ? `<tr><td>Processing Speed</td><td class="metric-value">${brainData.processing_speed}%</td></tr>` : ''}
          ${brainData.tracking_focus ? `<tr><td>Tracking / Focus</td><td class="metric-value">${brainData.tracking_focus}%</td></tr>` : ''}
          ${brainData.impulse_control ? `<tr><td>Impulse Control</td><td class="metric-value">${brainData.impulse_control}%</td></tr>` : ''}
          ${brainData.decision_making ? `<tr><td>Decision Making</td><td class="metric-value">${brainData.decision_making}%</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Body Metrics -->
    ${Object.keys(bodyData).length > 0 ? `
    <div class="metrics-section">
      <h4>🏃 Body (Biomechanics)</h4>
      <table class="metrics-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          ${bodyData.com_forward_movement_pct ? `<tr><td>COM Forward Movement</td><td class="metric-value">${bodyData.com_forward_movement_pct.toFixed(1)}%</td></tr>` : ''}
          ${bodyData.spine_stability_score ? `<tr><td>Spine Stability</td><td class="metric-value">${bodyData.spine_stability_score.toFixed(0)}</td></tr>` : ''}
          ${bodyData.head_movement_inches ? `<tr><td>Head Movement</td><td class="metric-value">${bodyData.head_movement_inches.toFixed(1)}"</td></tr>` : ''}
          ${bodyData.sequence_correct !== null ? `<tr><td>Kinetic Sequence</td><td class="metric-value">${bodyData.sequence_correct ? '✓ Correct' : '✗ Incorrect'}</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Bat Metrics -->
    ${Object.keys(batData).length > 0 ? `
    <div class="metrics-section">
      <h4>⚾ Bat (Swing Mechanics)</h4>
      <table class="metrics-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          ${batData.avg_bat_speed ? `<tr><td>Average Bat Speed</td><td class="metric-value">${batData.avg_bat_speed.toFixed(1)} mph</td></tr>` : ''}
          ${batData.attack_angle_avg ? `<tr><td>Attack Angle (Avg)</td><td class="metric-value">${batData.attack_angle_avg.toFixed(1)}°</td></tr>` : ''}
          ${batData.time_in_zone_ms ? `<tr><td>Time in Zone</td><td class="metric-value">${batData.time_in_zone_ms.toFixed(0)} ms</td></tr>` : ''}
          ${batData.bat_speed_sd ? `<tr><td>Bat Speed Consistency (SD)</td><td class="metric-value">${batData.bat_speed_sd.toFixed(1)} mph</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Ball Metrics -->
    ${Object.keys(ballData).length > 0 ? `
    <div class="metrics-section">
      <h4>🎯 Ball (Outcomes)</h4>
      <table class="metrics-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          ${ballData.ev90 ? `<tr><td>EV90 (Exit Velocity)</td><td class="metric-value">${ballData.ev90.toFixed(1)} mph</td></tr>` : ''}
          ${ballData.la90 ? `<tr><td>LA90 (Launch Angle)</td><td class="metric-value">${ballData.la90.toFixed(1)}°</td></tr>` : ''}
          ${ballData.barrel_like_rate ? `<tr><td>Barrel Rate</td><td class="metric-value">${ballData.barrel_like_rate.toFixed(1)}%</td></tr>` : ''}
          ${ballData.hard_hit_rate ? `<tr><td>Hard Hit Rate</td><td class="metric-value">${ballData.hard_hit_rate.toFixed(1)}%</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <p><strong>The Hitting Skool 4B System</strong></p>
      <p>Brain • Body • Bat • Ball</p>
      <p style="margin-top: 10px;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p style="margin-top: 5px; font-size: 10px;">© ${new Date().getFullYear()} The Hitting Skool. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
