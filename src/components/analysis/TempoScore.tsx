import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { getSeverityColor, getSeverityBorderColor, getSeverity } from "@/lib/analysis/types";

interface TempoScoreProps {
  kinematics: any;
}

export function TempoScore({ kinematics }: TempoScoreProps) {
  // Extract timing data
  const loadDuration = kinematics?.loadDuration || 0.45; // seconds
  const explosiveDuration = kinematics?.explosiveDuration || 0.15; // seconds
  const ratio = loadDuration > 0 ? (explosiveDuration / loadDuration).toFixed(2) : '0.00';
  
  // Calculate score based on optimal tempo (A:B ratio around 3:1 or 0.33)
  const optimalRatio = 0.33;
  const ratioNum = parseFloat(ratio);
  const deviation = Math.abs(ratioNum - optimalRatio);
  let tempoScore = 100;
  
  if (deviation > 0.15) tempoScore = 40;
  else if (deviation > 0.10) tempoScore = 60;
  else if (deviation > 0.05) tempoScore = 80;
  else tempoScore = 95;
  
  const severity = getSeverity(tempoScore);
  
  return (
    <Card className={`border-2 ${getSeverityBorderColor(severity)}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Tempo Score</CardTitle>
              <CardDescription>Load-to-fire timing</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getSeverityColor(severity)}`}>
              {tempoScore}
            </div>
            <div className="text-sm text-muted-foreground">/ 100</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Coach Rick Explanation */}
        <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-primary">
          <p className="text-sm font-medium mb-2">Coach Rick Says:</p>
          <p className="text-sm text-muted-foreground">
            {tempoScore >= 80
              ? "Great tempo! You're loading smoothly and exploding on time. This creates natural rhythm and power."
              : tempoScore >= 60
              ? "Your timing is decent but could be smoother. Try to feel a 3-to-1 rhythm: slow load, quick fire."
              : "Your tempo needs work. You're either rushing the load or taking too long to fire. Work on a smooth, controlled load followed by an explosive launch."}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border-2 p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-1">A:B Ratio</div>
            <div className="text-2xl font-bold">{ratio}</div>
            <div className="text-xs text-muted-foreground mt-1">Optimal: 0.30-0.35</div>
          </div>
          
          <div className="rounded-lg border-2 p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-1">Load Duration</div>
            <div className="text-2xl font-bold">{(loadDuration * 1000).toFixed(0)}ms</div>
            <div className="text-xs text-muted-foreground mt-1">Typical: 400-500ms</div>
          </div>
          
          <div className="rounded-lg border-2 p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-1">Launch Duration</div>
            <div className="text-2xl font-bold">{(explosiveDuration * 1000).toFixed(0)}ms</div>
            <div className="text-xs text-muted-foreground mt-1">Typical: 130-160ms</div>
          </div>
        </div>

        {/* Technical Explanation */}
        <div className="rounded-lg border p-4 bg-muted/20">
          <h4 className="font-semibold mb-2 text-sm">Technical Details</h4>
          <p className="text-xs text-muted-foreground">
            Tempo measures the ratio of your load phase (gathering energy) to your fire phase (releasing energy). 
            Elite hitters typically show a 3:1 ratio - a controlled, smooth load followed by an explosive launch. 
            This rhythm allows for better timing adjustments and maximum power generation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
