import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getRecommendedDrills } from "@/lib/drillRecommendations";
import { Clock, Target } from "lucide-react";

interface DrillRecommendationsProps {
  fourbScores: any;
  brainData?: any;
  bodyData?: any;
  batData?: any;
  ballData?: any;
}

export function DrillRecommendations({
  fourbScores,
  brainData,
  bodyData,
  batData,
  ballData
}: DrillRecommendationsProps) {
  const [drills, setDrills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [fourbScores]);

  const loadRecommendations = async () => {
    // Fetch all drills from database
    const { data: allDrills } = await supabase
      .from('drills')
      .select('*');

    if (!allDrills || !fourbScores) {
      setLoading(false);
      return;
    }

    // Get recommended drills based on scores
    const recommended = getRecommendedDrills(
      fourbScores,
      allDrills,
      brainData,
      bodyData,
      batData,
      ballData
    );

    setDrills(recommended);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (drills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Training</CardTitle>
          <CardDescription>Targeted drills based on your 4B scores</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No specific recommendations at this time. Keep up the great work!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Training</CardTitle>
        <CardDescription>Targeted drills to improve your weak areas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {drills.map((drill) => (
            <div 
              key={drill.id} 
              className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{drill.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{drill.category}</Badge>
                    {drill.difficulty && (
                      <Badge variant="secondary">{drill.difficulty}</Badge>
                    )}
                  </div>
                </div>
                {drill.duration_minutes && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{drill.duration_minutes} min</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-2">
                {drill.description}
              </p>

              {drill.focus_metric && (
                <div className="flex items-center gap-1 mt-3 text-xs text-primary">
                  <Target className="h-3 w-3" />
                  <span className="capitalize">
                    Focus: {drill.focus_metric.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
