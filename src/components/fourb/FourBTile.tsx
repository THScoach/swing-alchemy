import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Brain, User, Activity, Target } from "lucide-react";
import { TileData } from "@/lib/fourb/types";

interface FourBTileProps {
  tile: TileData;
  onClick: () => void;
}

const icons = {
  brain: Brain,
  body: User,
  bat: Activity,
  ball: Target,
};

const stateColors = {
  'synced': 'from-success/10 to-success/5 border-success/20',
  'developing': 'from-warning/10 to-warning/5 border-warning/20',
  'limiting': 'from-destructive/10 to-destructive/5 border-destructive/20',
  'no-data': 'from-muted/10 to-muted/5 border-border',
};

const iconColors = {
  'synced': 'text-success',
  'developing': 'text-warning',
  'limiting': 'text-destructive',
  'no-data': 'text-muted-foreground',
};

export function FourBTile({ tile, onClick }: FourBTileProps) {
  const Icon = icons[tile.name];
  const bgGradient = stateColors[tile.state];
  const iconColor = iconColors[tile.state];

  return (
    <Card
      className={`bg-gradient-to-br ${bgGradient} cursor-pointer hover:shadow-lg transition-all border`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            <span className="font-semibold capitalize">{tile.title}</span>
          </div>
          {tile.score !== undefined && (
            <span className="text-2xl font-bold">{Math.round(tile.score)}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className={`text-sm font-medium ${iconColor}`}>
            {tile.state === 'no-data' ? 'No Data' : tile.description}
          </div>
          {tile.score !== undefined && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  tile.state === 'synced' ? 'bg-success' :
                  tile.state === 'developing' ? 'bg-warning' :
                  'bg-destructive'
                }`}
                style={{ width: `${Math.min(tile.score, 100)}%` }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
