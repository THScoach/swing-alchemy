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
            <div>
              <DialogTitle className="text-2xl">{config.title}</DialogTitle>
              <DialogDescription>
                {score !== undefined ? (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-3xl font-bold">{Math.round(score)}</span>
                    <Badge variant={state === 'synced' ? 'default' : state === 'developing' ? 'secondary' : 'destructive'}>
                      {state}
                    </Badge>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No data available yet</span>
                )}
              </DialogDescription>
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
              {config.metrics.map((metric) => (
                <div key={metric} className="p-4 border rounded-lg bg-muted/30">
                  <div className="text-sm text-muted-foreground">{metric}</div>
                  <div className="text-2xl font-bold mt-1">
                    {data ? '—' : 'No Data'}
                  </div>
                </div>
              ))}
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
