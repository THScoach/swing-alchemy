import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'
import { Resend } from 'https://esm.sh/resend@2.0.0'
import { renderAsync } from 'https://esm.sh/@react-email/components@0.0.15'
import React from 'https://esm.sh/react@18.2.0'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.15'

// Centralized email configuration
const SUPPORT_EMAIL = Deno.env.get("SUPPORT_EMAIL") || "support@4bhitting.com";
const FROM_BRAND = Deno.env.get("FROM_BRAND") || "Coach Rick @ 4B Hitting";
const FROM_ADDRESS = `${FROM_BRAND} <${SUPPORT_EMAIL}>`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  playerId: string
  analysisId: string
}

// Inline email template
const HybridReactivationConfirmation = ({ firstName, dashboardUrl }: { firstName: string; dashboardUrl: string }) => (
  React.createElement(Html, null,
    React.createElement(Head, null),
    React.createElement(Preview, null, "Got It — Your Swing Is Being Reanalyzed"),
    React.createElement(Body, { style: {
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    }},
      React.createElement(Container, { style: {
        margin: '0 auto',
        padding: '20px 0 48px',
        maxWidth: '600px',
      }},
        React.createElement(Heading, { style: {
          color: '#1a1a1a',
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '40px 0 20px',
          padding: '0',
          lineHeight: '1.4',
        }}, "Welcome back — your new swing just came through. 🔥"),
        
        React.createElement(Text, { style: {
          color: '#333',
          fontSize: '16px',
          lineHeight: '26px',
          margin: '16px 0',
        }}, `Hey ${firstName},`),
        
        React.createElement(Text, { style: {
          color: '#333',
          fontSize: '16px',
          lineHeight: '26px',
          margin: '16px 0',
        }}, 
          "I've queued it for analysis, and your Hybrid AI is already recalculating your updated 4B and tempo metrics.",
          React.createElement('br'),
          "You'll see your refreshed data and drill recommendations inside your dashboard within 24 hours."
        ),
        
        React.createElement(Heading, { style: {
          color: '#1a1a1a',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '24px 0 16px',
          padding: '0',
          lineHeight: '1.4',
        }}, "Here's what's happening right now:"),
        
        React.createElement(Text, { style: {
          color: '#333',
          fontSize: '16px',
          lineHeight: '26px',
          margin: '16px 0',
        }}, 
          "✅ AI recalibrates your tempo + sequencing",
          React.createElement('br'),
          "✅ Reboot metrics update (if Model Mode)",
          React.createElement('br'),
          "✅ Coach Rick review scheduled for Monday's session"
        ),
        
        React.createElement(Text, { style: {
          color: '#333',
          fontSize: '16px',
          lineHeight: '26px',
          margin: '16px 0',
        }}, 
          "You're back in rhythm — stay with it this week.",
          React.createElement('br'),
          "If you upload again within 3 days, your metrics confidence score increases automatically."
        ),
        
        React.createElement(Link, { 
          href: dashboardUrl, 
          style: {
            backgroundColor: '#FFD700',
            borderRadius: '5px',
            color: '#000',
            display: 'inline-block',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '12px 24px',
            textDecoration: 'none',
            textAlign: 'center',
            margin: '20px 0',
          }
        }, "View My Updated Dashboard →"),
        
        React.createElement(Text, { style: {
          color: '#333',
          fontSize: '16px',
          lineHeight: '26px',
          margin: '16px 0',
        }}, "Proud of you for getting back after it."),
        
        React.createElement(Text, { style: {
          color: '#333',
          fontSize: '16px',
          lineHeight: '26px',
          margin: '24px 0',
          fontStyle: 'italic',
        }}, 
          "— Coach Rick",
          React.createElement('br'),
          '"The feel makes the data make sense."'
        ),
        
        React.createElement(Text, { style: {
          color: '#898989',
          fontSize: '12px',
          lineHeight: '22px',
          marginTop: '32px',
          textAlign: 'center',
        }}, "The Hitting Skool | Hybrid Coaching Program")
      )
    )
  )
)

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { playerId, analysisId }: RequestBody = await req.json()

    console.log('Checking reactivation for player:', playerId)

    // Get player details with profile
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*, profiles!players_profile_id_fkey(name, phone, subscription_tier)')
      .eq('id', playerId)
      .single()

    if (playerError || !player) {
      console.error('Player not found:', playerError)
      return new Response(
        JSON.stringify({ error: 'Player not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const profile = player.profiles as any
    if (!profile || profile.subscription_tier !== 'Hybrid_Coaching') {
      console.log('Player not on Hybrid Coaching subscription')
      return new Response(
        JSON.stringify({ message: 'Not a Hybrid Coaching subscriber' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for previous uploads to determine if this is a reactivation
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const { data: recentAnalyses, error: analysesError } = await supabase
      .from('video_analyses')
      .select('created_at')
      .eq('player_id', playerId)
      .neq('id', analysisId) // Exclude the current upload
      .order('created_at', { ascending: false })
      .limit(1)

    if (analysesError) {
      console.error('Error checking previous analyses:', analysesError)
      throw analysesError
    }

    // Check if player was inactive for 14+ days
    const wasInactive = !recentAnalyses || 
      recentAnalyses.length === 0 || 
      new Date(recentAnalyses[0].created_at) < fourteenDaysAgo

    if (!wasInactive) {
      console.log('Player was not inactive for 14+ days, skipping confirmation')
      return new Response(
        JSON.stringify({ message: 'Player was not inactive' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Player reactivated after 14+ days! Sending confirmations...')

    const firstName = profile.name?.split(' ')[0] || 'there'
    const dashboardUrl = `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://app.')}/dashboard`

    // Send Email if Resend is configured
    if (resendApiKey) {
      const resend = new Resend(resendApiKey)
      
      const emailHtml = await renderAsync(
        React.createElement(HybridReactivationConfirmation, {
          firstName,
          dashboardUrl,
        })
      )

      const { data: emailData, error: emailError } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [profile.email || ''],
        subject: 'Got It — Your Swing Is Being Reanalyzed',
        html: emailHtml,
        reply_to: [SUPPORT_EMAIL],
      })

      if (emailError) {
        console.error('Email send error:', emailError)
      } else {
        console.log('Reactivation email sent:', emailData)
        
        // Log email in communications table
        await supabase.from('communications').insert({
          player_id: playerId,
          channel: 'email',
          message_type: 'reactivation_confirmation',
          recipient_email: profile.email,
          message_body: 'Reactivation confirmation email',
          status: 'sent',
          external_id: emailData?.id,
        })
      }
    }

    // Send SMS if Twilio is configured and player has phone
    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber && profile.phone) {
      const smsBody = `🔥 Nice work ${firstName}! Your new swing came through. AI analysis is running now — check your dashboard soon for updated metrics + drill recs. ➡️ ${dashboardUrl}`

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
      const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)

      const smsResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: profile.phone,
          From: twilioPhoneNumber,
          Body: smsBody,
        }),
      })

      const smsResult = await smsResponse.json()

      if (smsResponse.ok) {
        console.log('Reactivation SMS sent:', smsResult.sid)
        
        // Log SMS in communications table
        await supabase.from('communications').insert({
          player_id: playerId,
          channel: 'sms',
          message_type: 'reactivation_confirmation',
          recipient_phone: profile.phone,
          message_body: smsBody,
          status: 'sent',
          external_id: smsResult.sid,
        })
      } else {
        console.error('SMS send error:', smsResult)
      }
    }

    // Update player's last_active timestamp
    await supabase
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', player.profile_id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Reactivation confirmations sent',
        wasInactive 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in send-reactivation-confirmation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
