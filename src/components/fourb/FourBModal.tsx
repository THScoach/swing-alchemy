import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TileName, ContextTag } from "@/lib/fourb/types";
import { Brain, User, Activity, Target, Upload, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FourBModalProps {
  isOpen: boolean;
  onClose: () => void;
  tileName: TileName;
  score?: number;
  state: string;
  data?: any;
}

const tileConfig = {
  brain: {
    icon: Brain,
    title: "Brain (S2 Cognition)",
    color: "text-success",
    metrics: ["Processing Speed", "Tracking/Focus", "Impulse Control", "Decision Making"],
    cta: "Upload S2 Report",
    learnMore: "Learn About S2",
  },
  body: {
    icon: User,
    title: "Body (Motion)",
    color: "text-primary",
    metrics: ["COM Movement", "Spine Stability", "Head Movement", "Sequence"],
    cta: "Upload Motion Data",
    learnMore: "View Body Drills",
  },
  bat: {
    icon: Activity,
    title: "Bat (Mechanics)",
    color: "text-warning",
    metrics: ["Bat Speed", "Attack Angle", "Time in Zone", "Consistency"],
    cta: "Connect Blast",
    learnMore: "View Bat Drills",
  },
  ball: {
    icon: Target,
    title: "Ball (Outcomes)",
    color: "text-destructive",
    metrics: ["EV90", "LA90", "Barrel Rate", "Hard Hit %"],
    cta: "Upload Ball Data",
    learnMore: "View Ball Drills",
  },
};

export function FourBModal({ isOpen, onClose, tileName, score, state, data }: FourBModalProps) {
  const config = tileConfig[tileName];
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Icon className={`h-8 w-8 ${config.color}`} />
            <div className="flex-1">
              <DialogTitle className="text-2xl">{config.title}</DialogTitle>
              {score !== undefined ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-3xl font-bold">{Math.round(score)}</span>
                  <Badge variant={state === 'synced' ? 'default' : state === 'developing' ? 'secondary' : 'destructive'}>
                    {state}
                  </Badge>
                </div>
              ) : (
                <DialogDescription>No data available yet</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {tileName === 'body' && data && (
                <>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">COM Movement</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.com_forward_movement_pct ? `${data.com_forward_movement_pct.toFixed(1)}%` : '—'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">Spine Stability</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.spine_stability_score ? data.spine_stability_score.toFixed(0) : '—'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">Head Movement</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.head_movement_inches ? `${data.head_movement_inches.toFixed(1)}"` : '—'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">Sequence</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.sequence_correct !== null ? (data.sequence_correct ? '✓ Correct' : '✗ Incorrect') : '—'}
                    </div>
                  </div>
                </>
              )}
              
              {tileName === 'brain' && data && (
                <>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">Processing Speed</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.processing_speed ? `${data.processing_speed}%` : '—'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">Tracking/Focus</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.tracking_focus ? `${data.tracking_focus}%` : '—'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">Impulse Control</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.impulse_control ? `${data.impulse_control}%` : '—'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">Decision Making</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.decision_making ? `${data.decision_making}%` : '—'}
                    </div>
                  </div>
                </>
              )}
              
              {tileName === 'bat' && data && (
                <>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">Bat Speed</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.avg_bat_speed ? `${data.avg_bat_speed.toFixed(1)} mph` : '—'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">Attack Angle</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.attack_angle_avg ? `${data.attack_angle_avg.toFixed(1)}°` : '—'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">Time in Zone</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.time_in_zone_ms ? `${data.time_in_zone_ms.toFixed(0)}ms` : '—'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">Consistency</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.bat_speed_sd ? `${data.bat_speed_sd.toFixed(1)} mph` : '—'}
                    </div>
                  </div>
                </>
              )}
              
              {tileName === 'ball' && data && (
                <>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">EV90</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.ev90 ? `${data.ev90.toFixed(1)} mph` : '—'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">LA90</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.la90 ? `${data.la90.toFixed(1)}°` : '—'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">Barrel Rate</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.barrel_like_rate ? `${data.barrel_like_rate.toFixed(1)}%` : '—'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">Hard Hit %</div>
                    <div className="text-2xl font-bold mt-1">
                      {data.hard_hit_rate ? `${data.hard_hit_rate.toFixed(1)}%` : '—'}
                    </div>
                  </div>
                </>
              )}
              
              {!data && (
                config.metrics.map((metric) => (
                  <div key={metric} className="p-4 border rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">{metric}</div>
                    <div className="text-2xl font-bold mt-1">No Data</div>
                  </div>
                ))
              )}
            </div>

            {!data && (
              <div className="p-6 border rounded-lg bg-muted/10 text-center space-y-4">
                <p className="text-muted-foreground">
                  Upload data to see your {tileName} performance metrics and insights.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    {config.cta}
                  </Button>
                  <Button variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {config.learnMore}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Context Filters</h3>
              <div className="flex gap-2">
                <Badge variant="outline">All</Badge>
                <Badge variant="outline">Game</Badge>
                <Badge variant="outline">Practice</Badge>
                <Badge variant="outline">Drill</Badge>
              </div>
            </div>
            <div className="p-8 border rounded-lg bg-muted/10 text-center">
              <p className="text-muted-foreground">Detailed analysis coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="p-8 border rounded-lg bg-muted/10 text-center">
              <p className="text-muted-foreground">Historical trends coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
