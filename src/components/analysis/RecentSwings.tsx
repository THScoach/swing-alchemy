import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface RecentSwing {
  id: string;
  created_at: string;
  overall_score: number;
  anchor_score: number;
  stability_score: number;
  whip_score: number;
  kinetic_score: number;
}

interface RecentSwingsProps {
  swings: RecentSwing[];
  currentSwingId: string;
}

export function RecentSwings({ swings, currentSwingId }: RecentSwingsProps) {
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-[hsl(var(--primary))] font-header">Recent Swings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {swings.map((swing) => (
            <div
              key={swing.id}
              className={`
                p-4 rounded-lg border transition-all cursor-pointer
                ${swing.id === currentSwingId 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }
              `}
              onClick={() => navigate(`/analyze/${swing.id}`)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(swing.created_at), { addSuffix: true })}
                </span>
                <div className="flex items-center gap-3 text-sm">
                  <div className="font-semibold text-foreground">
                    Overall {swing.overall_score}
                  </div>
                  <div className={`${getScoreColor(swing.anchor_score)}`}>
                    A: {swing.anchor_score}
                  </div>
                  <div className={`${getScoreColor(swing.stability_score)}`}>
                    S: {swing.stability_score}
                  </div>
                  <div className={`${getScoreColor(swing.whip_score)}`}>
                    W: {swing.whip_score}
                  </div>
                  <div className={`${getScoreColor(swing.kinetic_score)}`}>
                    KS: {swing.kinetic_score}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
