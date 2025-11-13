// Category Breakdown Modal - Shows sub-metrics details

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryScore, SubMetricScore } from "@/lib/analysis/types";
import { getSeverityColor, getSeverityBorderColor } from "@/lib/analysis/types";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CategoryBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: CategoryScore | null;
  compareCategory?: CategoryScore | null;
  isComparison?: boolean;
}

export function CategoryBreakdownModal({
  isOpen,
  onClose,
  title,
  category,
  compareCategory,
  isComparison = false,
}: CategoryBreakdownModalProps) {
  if (!category) return null;

  // Sort sub-metrics by score
  const sortedMetrics = [...category.subMetrics].sort((a, b) => b.score - a.score);
  const topStrengths = sortedMetrics.slice(0, 2);
  const bottomIssues = sortedMetrics.slice(-2).reverse();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0A0A0A]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#FFD700] font-header">
            {title} Breakdown
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detailed sub-metric analysis {isComparison && "with comparison"}
          </DialogDescription>
        </DialogHeader>

        {/* Overall Score */}
        <Card className="bg-[#111113] border-[#303035]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Category Score</h3>
                <p className="text-sm text-muted-foreground">Average of all sub-metrics</p>
              </div>
              <div className="text-5xl font-bold text-[#FFD700]">
                {category.score}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sub-metrics List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Sub-Metrics</h3>
          {category.subMetrics.map((metric) => {
            const compareMetric = compareCategory?.subMetrics.find(m => m.id === metric.id);
            const diff = compareMetric ? metric.score - compareMetric.score : 0;
            
            return (
              <Card 
                key={metric.id} 
                className={`bg-[#111113] border-2 ${getSeverityBorderColor(metric.severity)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{metric.label}</h4>
                        <Badge variant="outline" className={getSeverityColor(metric.severity)}>
                          {metric.severity}
                        </Badge>
                      </div>
                      
                      {/* Simple Description */}
                      <p className="text-sm text-foreground font-medium">
                        {metric.simpleDescription}
                      </p>
                      
                      {/* Coach Rick Tip */}
                      <div className="bg-[#0A0A0A] border border-[#FFD700]/20 rounded-lg p-3">
                        <p className="text-xs font-semibold text-[#FFD700] mb-1">Coach Rick Says:</p>
                        <p className="text-sm text-muted-foreground italic">
                          {metric.coachRickTip}
                        </p>
                      </div>
                      
                      {/* Technical Description (smaller, less prominent) */}
                      <details className="text-xs text-muted-foreground/70">
                        <summary className="cursor-pointer hover:text-muted-foreground">
                          Technical Details
                        </summary>
                        <p className="mt-1 pl-2 border-l border-border">{metric.description}</p>
                      </details>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        {metric.score}
                      </div>
                      {isComparison && compareMetric && (
                        <div className={`flex items-center gap-1 text-sm ${
                          diff > 0 ? 'text-green-500' : diff < 0 ? 'text-[#EF4444]' : 'text-muted-foreground'
                        }`}>
                          {diff > 0 ? <TrendingUp className="h-3 w-3" /> : 
                           diff < 0 ? <TrendingDown className="h-3 w-3" /> : 
                           <span>-</span>}
                          {diff !== 0 && `${Math.abs(diff)}`}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Top Strengths & Fix-First Issues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="bg-[#111113] border-green-500 border-2">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-green-500 mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top 2 Strengths
              </h3>
              <ul className="space-y-2">
                {topStrengths.map(metric => (
                  <li key={metric.id} className="text-sm">
                    <span className="font-semibold text-foreground">{metric.label}</span>
                    <span className="text-muted-foreground"> - {metric.score}/100</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#111113] border-[#EF4444] border-2">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-[#EF4444] mb-3 flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Top 2 Fix-First Issues
              </h3>
              <ul className="space-y-2">
                {bottomIssues.map(metric => (
                  <li key={metric.id} className="text-sm">
                    <span className="font-semibold text-foreground">{metric.label}</span>
                    <span className="text-muted-foreground"> - {metric.score}/100</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
