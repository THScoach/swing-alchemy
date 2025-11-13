// Comparison Metric Strip - Shows athlete vs model scores

import { Card, CardContent } from "@/components/ui/card";
import { SwingScore } from "@/lib/analysis/types";
import { getSeverityBorderColor } from "@/lib/analysis/types";

interface ComparisonMetricStripProps {
  athleteScore: SwingScore;
  modelScore: SwingScore | null;
  onCategoryClick: (category: "anchor" | "stability" | "whip") => void;
}

export function ComparisonMetricStrip({
  athleteScore,
  modelScore,
  onCategoryClick,
}: ComparisonMetricStripProps) {
  const categories: Array<{ key: "anchor" | "stability" | "whip"; label: string }> = [
    { key: "anchor", label: "Anchor" },
    { key: "stability", label: "Stability" },
    { key: "whip", label: "Whip" },
  ];

  return (
    <Card className="bg-[#111113] border-[#303035] mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {categories.map(({ key, label }) => {
            const athleteValue = athleteScore[key].score;
            const modelValue = modelScore ? modelScore[key].score : null;
            const diff = modelValue ? athleteValue - modelValue : 0;
            const isBehind = diff < -15; // Significantly behind if more than 15 points lower

            const athleteSeverity = 
              athleteValue >= 80 ? "green" : 
              athleteValue >= 60 ? "yellow" : 
              athleteValue >= 40 ? "orange" : "red";

            return (
              <div
                key={key}
                onClick={() => onCategoryClick(key)}
                className="cursor-pointer transition-all hover:scale-105"
              >
                <div className="text-center mb-2">
                  <h3 className="text-sm font-semibold text-[#FFD700] font-header uppercase tracking-wide">
                    {label}
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* Athlete Column */}
                  <div className={`p-3 rounded-lg border-2 ${getSeverityBorderColor(athleteSeverity)} ${
                    isBehind ? 'bg-[#EF4444]/10' : 'bg-[#111113]'
                  }`}>
                    <div className="text-xs text-[#EF4444] font-semibold mb-1">
                      ATHLETE
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {athleteValue}
                    </div>
                  </div>

                  {/* Model Column */}
                  <div className="p-3 rounded-lg border-2 border-[#FFD700] bg-[#111113]">
                    <div className="text-xs text-[#FFD700] font-semibold mb-1">
                      MODEL
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {modelValue !== null ? modelValue : "—"}
                    </div>
                  </div>
                </div>

                {isBehind && (
                  <div className="text-xs text-[#EF4444] text-center mt-2">
                    {Math.abs(diff)} pts behind
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
