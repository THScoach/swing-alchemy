import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModelRebootMetricsPanel } from "@/components/ModelRebootMetricsPanel";
import { Play, Star, Trash2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [analyzingSwings, setAnalyzingSwings] = useState<Set<string>>(new Set());

  if (!model) return null;

  const analyzedSwings = model.swings.filter(s => s.has_analysis && s.metrics_reboot);
  const swingCount = model.swings.length;

  const handleAnalyzeSwing = async (swing: ModelSwing) => {
    setAnalyzingSwings(prev => new Set(prev).add(swing.id));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Create or find model player (use null org if no org membership)
      const orgId = orgMember?.organization_id || null;
      
      let modelPlayerId = null;
      let query = supabase
        .from('players')
        .select('id')
        .eq('name', `MODEL_${model.player_name}`);
      
      if (orgId) {
        query = query.eq('organization_id', orgId);
      } else {
        query = query.is('organization_id', null);
      }
      
      const { data: existingPlayer } = await query.maybeSingle();

      if (existingPlayer) {
        modelPlayerId = existingPlayer.id;
      } else {
        const levelMap: Record<string, 'Youth (10-13)' | 'HS (14-18)' | 'College' | 'Pro' | 'Other'> = {
          'Youth': 'Youth (10-13)',
          'HS': 'HS (14-18)',
          'College': 'College',
          'Pro': 'Pro',
          'MLB': 'Pro',
          'MiLB': 'Pro',
        };

        // Map handedness to bats field (L/R -> Left/Right)
        const batsValue = model.handedness === 'L' ? 'Left' : 'Right';

        const { data: newPlayer, error: playerError } = await supabase
          .from('players')
          .insert([{
            name: `MODEL_${model.player_name}`,
            organization_id: orgId,
            profile_id: user.id,
            player_level: levelMap[model.level] || 'Other',
            bats: batsValue,
            sport: 'Baseball',
          }])
          .select('id')
          .single();
        
        if (playerError) {
          console.error('Player creation error:', playerError);
          throw new Error(`Failed to create model player: ${playerError.message}`);
        }
        
        if (newPlayer) modelPlayerId = newPlayer.id;
      }

      if (!modelPlayerId) throw new Error("Could not get model player ID");

      // Create video_analysis record
      const { data: analysisRecord, error: analysisInsertError } = await supabase
        .from('video_analyses')
        .insert({
          player_id: modelPlayerId,
          video_url: swing.video_url,
          mode: 'model',
          is_pro_model: true,
          pro_swing_id: swing.id,
          fps: swing.fps_confirmed || 240,
          fps_confirmed: swing.fps_confirmed || 240,
          processing_status: 'pending',
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (analysisInsertError) {
        console.error('Analysis record error:', analysisInsertError);
        throw new Error(`Failed to create analysis: ${analysisInsertError.message}`);
      }

      // Trigger analysis
      const { error: analysisError } = await supabase.functions.invoke('process-video-analysis', {
        body: {
          analysisId: analysisRecord.id,
          mode: 'model',
          level: model.level,
          handedness: model.handedness,
          fps_confirmed: swing.fps_confirmed || 240,
          source: 'pro_swing',
          proSwingId: swing.id,
        }
      });
      
      if (analysisError) {
        console.error('Analysis invocation error:', analysisError);
        throw new Error(`Analysis failed: ${analysisError.message}`);
      }

      toast({
        title: "Analysis Started",
        description: "Processing swing with Reboot metrics. Refresh in a moment to see results.",
      });

      // Reload after a delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to start analysis.",
        variant: "destructive",
      });
    } finally {
      setAnalyzingSwings(prev => {
        const next = new Set(prev);
        next.delete(swing.id);
        return next;
      });
    }
  };

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
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {new Date(swing.created_at).toLocaleDateString()}
                          {swing.fps_confirmed && ` • ${swing.fps_confirmed} FPS`}
                        </div>
                        {!swing.has_analysis && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnalyzeSwing(swing);
                            }}
                            disabled={analyzingSwings.has(swing.id)}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            {analyzingSwings.has(swing.id) ? 'Analyzing...' : 'Analyze Now'}
                          </Button>
                        )}
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
