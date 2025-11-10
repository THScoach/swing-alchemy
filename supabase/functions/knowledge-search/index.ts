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
    const { query, topic, level, limit = 3 } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query
    let dbQuery = supabase.from("notes").select("*");

    // Filter by topic if provided
    if (topic) {
      dbQuery = dbQuery.eq("topic", topic);
    }

    // Filter by level if provided
    if (level) {
      dbQuery = dbQuery.contains("level_tags", [level]);
    }

    // Execute query
    const { data: allNotes, error } = await dbQuery;

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Simple keyword-based search (MVP approach)
    // In production, this would use vector embeddings for semantic search
    const queryLower = query.toLowerCase();
    const scoredNotes = allNotes
      .map((note) => {
        let score = 0;

        // Score based on title match
        if (note.title?.toLowerCase().includes(queryLower)) {
          score += 10;
        }

        // Score based on body match
        const bodyMatches = (
          note.body.toLowerCase().match(new RegExp(queryLower, "g")) || []
        ).length;
        score += bodyMatches * 5;

        // Score based on tag matches
        if (note.tags) {
          const tagMatches = note.tags.filter((tag: string) =>
            tag.toLowerCase().includes(queryLower)
          ).length;
          score += tagMatches * 8;
        }

        // Score based on subtopic matches
        if (note.subtopics) {
          const subtopicMatches = note.subtopics.filter((subtopic: string) =>
            subtopic.toLowerCase().includes(queryLower)
          ).length;
          score += subtopicMatches * 7;
        }

        return { ...note, relevance_score: score };
      })
      .filter((note) => note.relevance_score > 0)
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit);

    return new Response(
      JSON.stringify({
        results: scoredNotes,
        count: scoredNotes.length,
        query,
        filters: { topic, level },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in knowledge-search function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
