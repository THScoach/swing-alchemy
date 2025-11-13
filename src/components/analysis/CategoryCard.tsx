// Category Card Component for 3-Pillar Display

import { Card, CardContent } from "@/components/ui/card";
import { CategoryScore } from "@/lib/analysis/types";
import { getSeverityBorderColor } from "@/lib/analysis/types";

interface CategoryCardProps {
  title: string;
  subtitle: string;
  category: CategoryScore;
  onClick: () => void;
}

export function CategoryCard({ title, subtitle, category, onClick }: CategoryCardProps) {
  const severity = category.score >= 80 ? "green" : 
                   category.score >= 60 ? "yellow" : 
                   category.score >= 40 ? "orange" : "red";
  
  const borderColor = getSeverityBorderColor(severity);

  return (
    <Card 
      className={`cursor-pointer transition-all hover:scale-105 border-2 ${borderColor} bg-[#111113]`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#FFD700] font-header mb-1">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>
          <div className="text-right ml-4">
            <div className="text-4xl font-bold text-foreground">
              {category.score}
            </div>
            <div className="text-sm text-muted-foreground">
              / 100
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
