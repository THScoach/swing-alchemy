import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Activity, Zap, Target, TrendingDown } from "lucide-react";

interface AthleteProfileData {
  playerId: string;
  name: string;
  fourB: {
    catchBarrelScore: number;
    brain: number;
    body: number;
    bat: number;
    ball: number;
  };
  bodyDetails?: {
    groundFlow: number;
    coreFlow: number;
  };
  trainingPriorities?: Array<{
    area: string;
    score: number;
  }>;
}

interface AthleteProfileCardProps {
  data: AthleteProfileData;
}

const getScoreState = (score: number) => {
  if (score >= 70) return 'synced';
  if (score >= 50) return 'developing';
  return 'limiting';
};

const stateColors = {
  synced: 'from-success/20 to-success/5 border-success/30',
  developing: 'from-warning/20 to-warning/5 border-warning/30',
  limiting: 'from-destructive/20 to-destructive/5 border-destructive/30',
};

const stateTextColors = {
  synced: 'text-success',
  developing: 'text-warning',
  limiting: 'text-destructive',
};

const pillars = [
  { key: 'brain' as const, label: 'Brain', icon: Brain },
  { key: 'body' as const, label: 'Body', icon: Activity },
  { key: 'bat' as const, label: 'Bat', icon: Zap },
  { key: 'ball' as const, label: 'Ball', icon: Target },
];

export function AthleteProfileCard({ data }: AthleteProfileCardProps) {
  const overallState = getScoreState(data.fourB.catchBarrelScore);

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{data.name}</CardTitle>
              <p className="text-sm text-muted-foreground">Athlete Profile</p>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${stateTextColors[overallState]}`}>
                {data.fourB.catchBarrelScore}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Catch Barrel Score
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 4B Pillar Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pillars.map(({ key, label, icon: Icon }) => {
          const score = data.fourB[key];
          const state = getScoreState(score);

          return (
            <Card
              key={key}
              className={`bg-gradient-to-br ${stateColors[state]} border`}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 ${stateTextColors[state]}`} />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <div className={`text-3xl font-bold ${stateTextColors[state]}`}>
                  {score}
                </div>
                <Progress value={score} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Body Details */}
      {data.bodyDetails && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Body Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ground Flow</span>
                  <span className={`font-medium ${stateTextColors[getScoreState(data.bodyDetails.groundFlow)]}`}>
                    {data.bodyDetails.groundFlow}
                  </span>
                </div>
                <Progress value={data.bodyDetails.groundFlow} className="h-1.5" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Core Flow</span>
                  <span className={`font-medium ${stateTextColors[getScoreState(data.bodyDetails.coreFlow)]}`}>
                    {data.bodyDetails.coreFlow}
                  </span>
                </div>
                <Progress value={data.bodyDetails.coreFlow} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Priorities */}
      {data.trainingPriorities && data.trainingPriorities.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Training Priorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.trainingPriorities.map((priority, index) => {
                const state = getScoreState(priority.score);
                return (
                  <div key={priority.area} className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{priority.area}</span>
                        <span className={`text-sm font-bold ${stateTextColors[state]}`}>
                          {priority.score}
                        </span>
                      </div>
                      <Progress value={priority.score} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
