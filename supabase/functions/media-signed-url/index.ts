import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mediaId, expiresInHours = 48 } = await req.json();

    if (!mediaId) {
      return new Response(
        JSON.stringify({ error: "mediaId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get video analysis to check org access
    const { data: video, error: videoError } = await supabase
      .from("video_analyses")
      .select("*, players(organization_id)")
      .eq("id", mediaId)
      .single();

    if (videoError || !video) {
      return new Response(
        JSON.stringify({ error: "Media not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const organizationId = video.players?.organization_id;

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: "Invalid media configuration" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check org membership
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for existing valid signed URL
    const { data: existingUrl } = await supabase
      .from("signed_urls")
      .select("*")
      .eq("media_id", mediaId)
      .eq("organization_id", organizationId)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (existingUrl) {
      return new Response(
        JSON.stringify({
          signedUrl: existingUrl.url,
          expiresAt: existingUrl.expires_at,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate new signed URL from storage
    const bucketName = "swing-videos";
    const filePath = video.video_url.split(`${bucketName}/`)[1];

    if (!filePath) {
      return new Response(
        JSON.stringify({ error: "Invalid video URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const expiresIn = expiresInHours * 3600; // Convert to seconds
    const { data: signedData, error: signError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (signError || !signedData) {
      console.error("Error creating signed URL:", signError);
      return new Response(
        JSON.stringify({ error: "Failed to generate signed URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();

    // Store signed URL
    await supabase.from("signed_urls").insert({
      media_id: mediaId,
      organization_id: organizationId,
      url: signedData.signedUrl,
      expires_at: expiresAt,
    });

    // Log the action
    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      user_id: user.id,
      action: "media_accessed",
      resource_type: "video",
      resource_id: mediaId,
      metadata: { expires_at: expiresAt },
    });

    return new Response(
      JSON.stringify({
        signedUrl: signedData.signedUrl,
        expiresAt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in media-signed-url:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
