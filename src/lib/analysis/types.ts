// 3-Pillar Scoring System Types

export type SeverityLevel = "green" | "yellow" | "orange" | "red";

export interface SubMetricScore {
  id: string;
  label: string;
  description: string;
  score: number; // 0-100
  severity: SeverityLevel;
}

export interface CategoryScore {
  score: number; // 0-100
  subMetrics: SubMetricScore[];
}

export interface SwingScore {
  anchor: CategoryScore;
  stability: CategoryScore;
  whip: CategoryScore;
  overall: number; // 0-100
}

// Helper function to determine severity
export function getSeverity(score: number): SeverityLevel {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  if (score >= 40) return "orange";
  return "red";
}

// Helper function to get color class for severity
export function getSeverityColor(severity: SeverityLevel): string {
  switch (severity) {
    case "green":
      return "text-green-500";
    case "yellow":
      return "text-yellow-500";
    case "orange":
      return "text-orange-500";
    case "red":
      return "text-red-500";
  }
}

// Helper function to get border color for severity
export function getSeverityBorderColor(severity: SeverityLevel): string {
  switch (severity) {
    case "green":
      return "border-green-500";
    case "yellow":
      return "border-yellow-500";
    case "orange":
      return "border-orange-500";
    case "red":
      return "border-red-500";
  }
}
