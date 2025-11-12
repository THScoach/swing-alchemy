import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, data?: any) => {
  console.log(`[check-inactive-players] ${step}`, data ? JSON.stringify(data, null, 2) : '');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting inactive player check");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find players with Hybrid_Coaching subscription who haven't uploaded in 14+ days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const twentyOneDaysAgo = new Date();
    twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);

    logStep("Fetching subscriptions", { fourteenDaysAgo: fourteenDaysAgo.toISOString() });

    // Get all active Hybrid_Coaching subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('subscription_type', 'Hybrid_Coaching')
      .eq('status', 'active');

    if (subError) {
      logStep("Error fetching subscriptions", subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      logStep("No active Hybrid subscriptions found");
      return new Response(
        JSON.stringify({ message: 'No active subscriptions', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    logStep(`Found ${subscriptions.length} active Hybrid subscriptions`);

    let scheduled = 0;
    let skipped = 0;

    for (const subscription of subscriptions) {
      const userId = subscription.user_id;
      
      // Check last upload date for this user
      const { data: lastUpload, error: uploadError } = await supabase
        .from('video_analyses')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (uploadError) {
        logStep(`Error checking uploads for user ${userId}`, uploadError);
        continue;
      }

      // If they have uploads and last upload is within 14 days, skip
      if (lastUpload && new Date(lastUpload.created_at) > fourteenDaysAgo) {
        logStep(`User ${userId} has recent uploads, skipping`);
        skipped++;
        continue;
      }

      // Check if they already have a pending reactivation email
      const { data: pendingEmail, error: pendingError } = await supabase
        .from('email_sequences')
        .select('id')
        .eq('user_id', userId)
        .eq('sequence_name', 'hybrid_reactivation')
        .eq('status', 'pending')
        .maybeSingle();

      if (pendingError) {
        logStep(`Error checking pending emails for user ${userId}`, pendingError);
        continue;
      }

      if (pendingEmail) {
        logStep(`User ${userId} already has pending reactivation email, skipping`);
        skipped++;
        continue;
      }

      // Check if they received a reactivation email in the last 21 days
      const { data: recentEmail, error: recentError } = await supabase
        .from('email_sequences')
        .select('sent_at')
        .eq('user_id', userId)
        .eq('sequence_name', 'hybrid_reactivation')
        .eq('status', 'sent')
        .gte('sent_at', twentyOneDaysAgo.toISOString())
        .maybeSingle();

      if (recentError) {
        logStep(`Error checking recent emails for user ${userId}`, recentError);
        continue;
      }

      if (recentEmail) {
        logStep(`User ${userId} received reactivation email recently, skipping`);
        skipped++;
        continue;
      }

      // Schedule reactivation email (send immediately)
      const { error: insertError } = await supabase
        .from('email_sequences')
        .insert({
          user_id: userId,
          sequence_name: 'hybrid_reactivation',
          email_number: 1,
          scheduled_at: new Date().toISOString(),
          status: 'pending'
        });

      if (insertError) {
        logStep(`Error scheduling reactivation email for user ${userId}`, insertError);
        continue;
      }

      logStep(`Scheduled reactivation email for user ${userId}`);
      scheduled++;
    }

    logStep("Inactive player check complete", { scheduled, skipped });

    return new Response(
      JSON.stringify({ 
        message: 'Inactive player check complete',
        scheduled,
        skipped,
        total: subscriptions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    logStep("Error in check-inactive-players", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
