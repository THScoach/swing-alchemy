import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FourBTile } from "./FourBTile";
import { FourBModal } from "./FourBModal";
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
  const [selectedTile, setSelectedTile] = useState<TileName | null>(null);
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [summary, setSummary] = useState<any>(null);

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
      {/* Overall 4B Score */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>4B Overall Score</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`text-6xl font-bold ${getOverallColor()}`}>
              {summary?.overallScore ? Math.round(summary.overallScore) : '—'}
            </div>
            <div>
              <Badge 
                variant={
                  summary?.overallState === 'synced' ? 'default' :
                  summary?.overallState === 'developing' ? 'secondary' :
                  'destructive'
                }
                className="text-lg px-4 py-2"
              >
                {summary?.overallLabel || 'No Data'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {playerLevel} Level
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Four Tiles */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((tile) => (
          <FourBTile
            key={tile.name}
            tile={tile}
            onClick={() => setSelectedTile(tile.name)}
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
              <Button 
                variant="link" 
                size="sm"
                onClick={() => setSelectedTile(summary.focusArea as TileName)}
              >
                View Details
              </Button>
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

      {/* Modal */}
      {selectedTile && (
        <FourBModal
          isOpen={!!selectedTile}
          onClose={() => setSelectedTile(null)}
          tileName={selectedTile}
          score={tiles.find(t => t.name === selectedTile)?.score}
          state={tiles.find(t => t.name === selectedTile)?.state || 'no-data'}
          data={
            selectedTile === 'brain' ? brainData :
            selectedTile === 'body' ? bodyData :
            selectedTile === 'bat' ? batData :
            ballData
          }
        />
      )}
    </div>
  );
}
