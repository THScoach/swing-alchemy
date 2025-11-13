import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SwingScore } from "@/lib/analysis/types";
import { KineticSequenceScore } from "@/lib/analysis/kineticSequenceScoring";

interface CoachRickInsightsProps {
  swingScore: SwingScore;
  kineticScore: KineticSequenceScore;
}

export function CoachRickInsights({ swingScore, kineticScore }: CoachRickInsightsProps) {
  const insights: string[] = [];

  // Analyze Anchor weaknesses
  swingScore.anchor.subMetrics.forEach(metric => {
    if (metric.severity === 'red' || metric.severity === 'orange') {
      insights.push(metric.coachRickTip);
    }
  });

  // Analyze Stability errors
  swingScore.stability.subMetrics.forEach(metric => {
    if (metric.severity === 'red' || metric.severity === 'orange') {
      insights.push(metric.coachRickTip);
    }
  });

  // Analyze Whip inefficiency
  swingScore.whip.subMetrics.forEach(metric => {
    if (metric.severity === 'red' || metric.severity === 'orange') {
      insights.push(metric.coachRickTip);
    }
  });

  // Add kinematic sequence insights
  if (kineticScore.overall < 70) {
    insights.push(kineticScore.coachRickSummary);
  }

  // Limit to top 5 most critical insights
  const topInsights = insights.slice(0, 5);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-[hsl(var(--primary))] font-header">Coach Rick AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {topInsights.map((insight, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-primary text-lg">•</span>
              <p className="text-sm text-foreground leading-relaxed">{insight}</p>
            </li>
          ))}
          {topInsights.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Great work! Your swing mechanics look solid. Keep practicing to maintain consistency.
            </p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
