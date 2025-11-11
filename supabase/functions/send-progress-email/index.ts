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
    const { playerId, analysisId, type } = await req.json();
    console.log('Sending progress email:', { playerId, analysisId, type });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if email subscription exists for this player
    const { data: subscription } = await supabaseClient
      .from('progress_email_subscriptions')
      .select('*')
      .eq('player_id', playerId)
      .maybeSingle();

    if (!subscription || subscription.frequency === 'off') {
      return new Response(
        JSON.stringify({ success: true, message: 'No active email subscription' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only send instant emails if frequency is 'instant' and type is 'instant'
    if (type === 'instant' && subscription.frequency !== 'instant') {
      return new Response(
        JSON.stringify({ success: true, message: 'Instant emails not enabled for this player' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch player and analysis data
    const { data: player } = await supabaseClient
      .from('players')
      .select('*, players!inner(name)')
      .eq('id', playerId)
      .single();

    const { data: analysis } = await supabaseClient
      .from('video_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    const { data: fourbScore } = await supabaseClient
      .from('fourb_scores')
      .select('*')
      .eq('analysis_id', analysisId)
      .maybeSingle();

    if (!fourbScore) {
      console.log('No 4B scores found for analysis:', analysisId);
      return new Response(
        JSON.stringify({ success: true, message: 'No 4B scores to report' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Integrate with Resend or your email provider
    // For now, just log the email content
    const emailContent = {
      to: subscription.email,
      subject: `New 4B Report for ${player?.name || 'Unknown Player'}`,
      html: generateEmailHTML({
        playerName: player?.name || 'Unknown Player',
        analysisDate: new Date(analysis?.created_at).toLocaleDateString(),
        fourbScore,
        analysisUrl: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/analyze/${analysisId}`
      })
    };

    console.log('Email content prepared:', emailContent);

    // TODO: Actually send email using Resend
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // await resend.emails.send(emailContent);

    return new Response(
      JSON.stringify({ success: true, message: 'Progress email sent (placeholder)' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending progress email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send progress email';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function generateEmailHTML(data: any): string {
  const { playerName, analysisDate, fourbScore, analysisUrl } = data;

  const getScoreColor = (score: number | null | undefined): string => {
    if (!score) return '#666';
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  const getScoreEmoji = (score: number | null | undefined): string => {
    if (!score) return '⚪';
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    return '🔴';
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>4B Progress Report - ${playerName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
              <h1 style="color: #FFD700; margin: 0; font-size: 28px;">🏏 New 4B Report</h1>
              <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 14px;">The Hitting Skool 4B System</p>
            </td>
          </tr>

          <!-- Player Info -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 22px;">${playerName}</h2>
              <p style="color: #666; margin: 0 0 20px 0;">Analysis Date: ${analysisDate}</p>

              <!-- 4B Scores -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td width="25%" align="center" style="padding: 10px;">
                    <div style="font-size: 12px; color: #666; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">BRAIN</div>
                    <div style="font-size: 36px; font-weight: 700; color: ${getScoreColor(fourbScore.brain_score)};">
                      ${getScoreEmoji(fourbScore.brain_score)} ${fourbScore.brain_score ? Math.round(fourbScore.brain_score) : '-'}
                    </div>
                  </td>
                  <td width="25%" align="center" style="padding: 10px;">
                    <div style="font-size: 12px; color: #666; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">BODY</div>
                    <div style="font-size: 36px; font-weight: 700; color: ${getScoreColor(fourbScore.body_score)};">
                      ${getScoreEmoji(fourbScore.body_score)} ${fourbScore.body_score ? Math.round(fourbScore.body_score) : '-'}
                    </div>
                  </td>
                  <td width="25%" align="center" style="padding: 10px;">
                    <div style="font-size: 12px; color: #666; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">BAT</div>
                    <div style="font-size: 36px; font-weight: 700; color: ${getScoreColor(fourbScore.bat_score)};">
                      ${getScoreEmoji(fourbScore.bat_score)} ${fourbScore.bat_score ? Math.round(fourbScore.bat_score) : '-'}
                    </div>
                  </td>
                  <td width="25%" align="center" style="padding: 10px;">
                    <div style="font-size: 12px; color: #666; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">BALL</div>
                    <div style="font-size: 36px; font-weight: 700; color: ${getScoreColor(fourbScore.ball_score)};">
                      ${getScoreEmoji(fourbScore.ball_score)} ${fourbScore.ball_score ? Math.round(fourbScore.ball_score) : '-'}
                    </div>
                  </td>
                </tr>
              </table>

              ${fourbScore.overall_score ? `
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <div style="font-size: 14px; color: #666; margin-bottom: 5px;">OVERALL 4B SCORE</div>
                <div style="font-size: 48px; font-weight: 700; color: ${getScoreColor(fourbScore.overall_score)};">
                  ${Math.round(fourbScore.overall_score)}
                </div>
              </div>
              ` : ''}

              ${fourbScore.focus_area ? `
              <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ca8a04;">
                <div style="font-size: 13px; color: #92400e; font-weight: 600; margin-bottom: 5px;">🎯 FOCUS AREA</div>
                <div style="color: #78350f;">${fourbScore.focus_area}</div>
              </div>
              ` : ''}

              ${fourbScore.strongest_area ? `
              <div style="background: #dcfce7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <div style="font-size: 13px; color: #14532d; font-weight: 600; margin-bottom: 5px;">💪 STRONGEST AREA</div>
                <div style="color: #15803d;">${fourbScore.strongest_area}</div>
              </div>
              ` : ''}

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${analysisUrl}" style="background-color: #FFD700; color: #1a1a1a; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                  View Full Analysis →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                <strong>The Hitting Skool 4B System</strong><br>
                Brain • Body • Bat • Ball<br>
                <span style="font-size: 10px; color: #999; margin-top: 10px; display: block;">
                  © ${new Date().getFullYear()} The Hitting Skool. All rights reserved.
                </span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
