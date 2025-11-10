import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GamePlanRequest {
  playerId: string;
  opponent?: string;
  pitcher?: string;
  pitchMix?: string[];
  velocityBand?: string;
  notes?: string;
  videoIds?: string[];
}

interface GamePlan {
  title: string;
  date: string;
  brainFocus: string;
  bodyPrep: string;
  batApproach: string;
  ballTargets: string;
  drills: string[];
  mentalCues: string[];
  notes: string;
}

export function useGamePlan() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateGamePlan = async (request: GamePlanRequest): Promise<GamePlan | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gameplan-generate", {
        body: request,
      });

      if (error) {
        if (error.message.includes("Enterprise subscription required")) {
          toast({
            title: "Enterprise Feature",
            description: "Game-Plan Generator requires an Enterprise subscription",
            variant: "destructive",
          });
          return null;
        }
        throw error;
      }

      return data as GamePlan;
    } catch (error) {
      console.error("Error generating game plan:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate game plan. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateGamePlan, loading };
}
