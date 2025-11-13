// Three Pillar Scores Display Component

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SwingScore } from "@/lib/analysis/types";
import { CategoryCard } from "./CategoryCard";
import { CategoryBreakdownModal } from "./CategoryBreakdownModal";

interface ThreePillarScoresProps {
  swingScore: SwingScore;
  compareScore?: SwingScore | null;
  isComparison?: boolean;
}

export function ThreePillarScores({ 
  swingScore, 
  compareScore, 
  isComparison = false 
}: ThreePillarScoresProps) {
  const [selectedCategory, setSelectedCategory] = useState<"anchor" | "stability" | "whip" | null>(null);

  const handleCategoryClick = (category: "anchor" | "stability" | "whip") => {
    setSelectedCategory(category);
  };

  const getCategoryData = () => {
    if (!selectedCategory) return { title: "", category: null, compareCategory: null };
    
    return {
      title: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1),
      category: swingScore[selectedCategory],
      compareCategory: compareScore ? compareScore[selectedCategory] : null,
    };
  };

  const categoryData = getCategoryData();

  return (
    <>
      {/* Overall Score */}
      <Card className="bg-[#111113] border-[#303035] mb-6">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#FFD700] font-header mb-2">
                Overall Swing Score
              </h2>
              <p className="text-muted-foreground">
                Average of Anchor, Stability, and Whip
              </p>
            </div>
            <div className="text-7xl font-bold text-foreground">
              {swingScore.overall}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Three Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <CategoryCard
          title="Anchor"
          subtitle="Rear leg & COM control"
          category={swingScore.anchor}
          onClick={() => handleCategoryClick("anchor")}
        />
        <CategoryCard
          title="Stability"
          subtitle="Kinematic sequence"
          category={swingScore.stability}
          onClick={() => handleCategoryClick("stability")}
        />
        <CategoryCard
          title="Whip"
          subtitle="Bat lag & distal whip"
          category={swingScore.whip}
          onClick={() => handleCategoryClick("whip")}
        />
      </div>

      {/* Category Breakdown Modal */}
      <CategoryBreakdownModal
        isOpen={selectedCategory !== null}
        onClose={() => setSelectedCategory(null)}
        title={categoryData.title}
        category={categoryData.category}
        compareCategory={categoryData.compareCategory}
        isComparison={isComparison}
      />
    </>
  );
}
