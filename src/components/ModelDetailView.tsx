import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModelRebootMetricsPanel } from "@/components/ModelRebootMetricsPanel";
import { Play, Star, Trash2 } from "lucide-react";

interface ModelSwing {
  id: string;
  label: string;
  video_url: string;
  description?: string;
  created_at: string;
  metrics_reboot?: any;
  fps_confirmed?: number;
  has_analysis: boolean;
}

interface ModelProfile {
  player_name: string;
  level: string;
  handedness: string;
  team?: string;
  height_inches?: number;
  weight_lbs?: number;
  swings: ModelSwing[];
}

interface ModelDetailViewProps {
  model: ModelProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (swingId: string) => void;
}

export const ModelDetailView = ({ model, open, onOpenChange, onDelete }: ModelDetailViewProps) => {
  if (!model) return null;

  const analyzedSwings = model.swings.filter(s => s.has_analysis && s.metrics_reboot);
  const swingCount = model.swings.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{model.player_name}</DialogTitle>
              <div className="flex gap-2 mt-2">
                {model.team && <Badge variant="secondary">{model.team}</Badge>}
                <Badge>{model.level}</Badge>
                <Badge variant="outline">{model.handedness === 'L' ? 'Left' : 'Right'} Handed</Badge>
              </div>
              {(model.height_inches || model.weight_lbs) && (
                <p className="text-sm text-muted-foreground mt-2">
                  {model.height_inches && `${Math.floor(model.height_inches / 12)}'${model.height_inches % 12}"`}
                  {model.height_inches && model.weight_lbs && ' • '}
                  {model.weight_lbs && `${model.weight_lbs} lbs`}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {swingCount} swing{swingCount !== 1 ? 's' : ''} total
              </p>
              <p className="text-sm text-muted-foreground">
                {analyzedSwings.length} analyzed
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="swings" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="swings" className="flex-1">
              Swings ({swingCount})
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1">
              Reports ({analyzedSwings.length})
            </TabsTrigger>
          </TabsList>

          {/* Swings Tab */}
          <TabsContent value="swings" className="space-y-4">
            {model.swings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No swings uploaded yet for this model.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {model.swings.map((swing) => (
                  <Card key={swing.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{swing.label}</CardTitle>
                          {swing.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {swing.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {swing.has_analysis && (
                            <Badge variant="secondary" className="text-xs">
                              Analyzed
                            </Badge>
                          )}
                          {onDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDelete(swing.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <video
                        src={swing.video_url}
                        controls
                        className="w-full aspect-video bg-black rounded-lg"
                      />
                      <div className="mt-2 text-xs text-muted-foreground">
                        {new Date(swing.created_at).toLocaleDateString()}
                        {swing.fps_confirmed && ` • ${swing.fps_confirmed} FPS`}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            {analyzedSwings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No analyzed swings yet.</p>
                  <p className="text-xs mt-2">
                    Upload and analyze swings to see Reboot-style metrics here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              analyzedSwings.map((swing) => (
                <Card key={swing.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{swing.label}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(swing.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {swing.fps_confirmed && (
                        <Badge variant="outline">
                          {swing.fps_confirmed} FPS Confirmed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ModelRebootMetricsPanel
                      metricsReboot={swing.metrics_reboot}
                      level={model.level}
                      handedness={model.handedness}
                    />
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
