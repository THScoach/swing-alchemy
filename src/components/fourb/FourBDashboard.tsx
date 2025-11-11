import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FourBAccordionTile } from "./FourBAccordionTile";
import { TileData, TileName, PlayerLevel } from "@/lib/fourb/types";
import { 
  calculateBrainScore, 
  calculateBodyScore, 
  calculateBatScore, 
  calculateBallScore,
  calculateFourBSummary 
} from "@/lib/fourb/scoring";
import { TrendingUp, Target, BookOpen } from "lucide-react";

interface FourBDashboardProps {
  playerId: string;
  playerLevel: PlayerLevel;
  brainData?: any;
  bodyData?: any;
  batData?: any;
  ballData?: any;
}

export function FourBDashboard({
  playerId,
  playerLevel,
  brainData,
  bodyData,
  batData,
  ballData,
}: FourBDashboardProps) {
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [contextFilter, setContextFilter] = useState<string>('All');

  useEffect(() => {
    // Calculate scores
    const brain = calculateBrainScore(brainData);
    const body = calculateBodyScore(bodyData);
    const bat = calculateBatScore(batData, playerLevel);
    const ball = calculateBallScore(ballData, playerLevel);

    const summaryData = calculateFourBSummary({
      brain: brain.score,
      body: body.score,
      bat: bat.score,
      ball: ball.score,
    });

    setSummary(summaryData);

    // Build tile data
    const tileData: TileData[] = [
      {
        name: 'brain',
        title: 'Brain',
        score: brain.score ?? undefined,
        state: brain.state,
        description: brain.label,
        color: brain.state === 'synced' ? 'success' : brain.state === 'developing' ? 'warning' : 'destructive',
      },
      {
        name: 'body',
        title: 'Body',
        score: body.score ?? undefined,
        state: body.state,
        description: body.label,
        color: body.state === 'synced' ? 'primary' : body.state === 'developing' ? 'warning' : 'destructive',
      },
      {
        name: 'bat',
        title: 'Bat',
        score: bat.score ?? undefined,
        state: bat.state,
        description: bat.label,
        color: bat.state === 'synced' ? 'warning' : bat.state === 'developing' ? 'warning' : 'destructive',
      },
      {
        name: 'ball',
        title: 'Ball',
        score: ball.score ?? undefined,
        state: ball.state,
        description: ball.label,
        color: ball.state === 'synced' ? 'destructive' : ball.state === 'developing' ? 'warning' : 'destructive',
      },
    ];

    setTiles(tileData);
  }, [brainData, bodyData, batData, ballData, playerLevel]);

  const getOverallColor = () => {
    if (!summary) return 'text-muted-foreground';
    if (summary.overallState === 'synced') return 'text-success';
    if (summary.overallState === 'developing') return 'text-warning';
    if (summary.overallState === 'limiting') return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">4B Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Powered by The Hitting Skool 4B System
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Share
          </Button>
          <Button variant="outline" size="sm">
            Export PDF
          </Button>
        </div>
      </div>

      {/* Context Filters */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-sm text-muted-foreground mr-2">Context:</span>
            {['All', 'Game', 'Practice', 'Drill'].map((filter) => (
              <Badge
                key={filter}
                variant={contextFilter === filter ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setContextFilter(filter)}
              >
                {filter}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall 4B Score */}
      <Card className="border-2 border-primary/20">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={`text-7xl md:text-8xl font-bold ${getOverallColor()}`}>
                {summary?.overallScore ? Math.round(summary.overallScore) : '—'}
              </div>
              <div className="border-l pl-6">
                <Badge 
                  variant={
                    summary?.overallState === 'synced' ? 'default' :
                    summary?.overallState === 'developing' ? 'secondary' :
                    'destructive'
                  }
                  className="text-xl px-6 py-2 mb-2"
                >
                  {summary?.overallLabel || 'No Data'}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {playerLevel} Level
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Four Accordion Tiles */}
      <div className="grid gap-4">
        {tiles.map((tile) => (
          <FourBAccordionTile
            key={tile.name}
            tile={tile}
            data={
              tile.name === 'brain' ? brainData :
              tile.name === 'body' ? bodyData :
              tile.name === 'bat' ? batData :
              ballData
            }
            onViewTrend={() => console.log('View trend for', tile.name)}
            onAssignDrill={() => console.log('Assign drill for', tile.name)}
          />
        ))}
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary?.strongestArea && (
            <div className="flex items-center gap-2">
              <Badge variant="default">Strongest Area</Badge>
              <span className="capitalize font-medium">{summary.strongestArea}</span>
            </div>
          )}
          {summary?.focusArea && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Focus Area</Badge>
              <span className="capitalize font-medium">{summary.focusArea}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Training */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recommended Training
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Featured Drill</h4>
              <p className="text-sm text-muted-foreground">
                Based on your focus area: {summary?.focusArea || 'Complete your assessment'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Course Module</h4>
              <p className="text-sm text-muted-foreground">
                Personalized training coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Training */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recommended Training
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {['Timing Drill', 'Sequence Work', 'Bat Path Drill'].map((drill, idx) => (
              <div key={idx} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="aspect-video bg-muted rounded-md mb-3" />
                <h4 className="font-semibold mb-1">{drill}</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Based on your {summary?.focusArea || 'performance'} area
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Drill
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
