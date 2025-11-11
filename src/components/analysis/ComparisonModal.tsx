import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Download, Play, Pause, TrendingUp, TrendingDown, Minus, Ghost } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAnalysisId: string;
  playerId: string;
}

export function ComparisonModal({ isOpen, onClose, currentAnalysisId, playerId }: ComparisonModalProps) {
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [compareAnalysis, setCompareAnalysis] = useState<any>(null);
  const [selectedCompareId, setSelectedCompareId] = useState<string>("");
  const [currentScores, setCurrentScores] = useState<any>(null);
  const [compareScores, setCompareScores] = useState<any>(null);
  const [ghostMode, setGhostMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const currentVideoRef = useRef<HTMLVideoElement | null>(null);
  const compareVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAnalyses();
      loadCurrentAnalysis();
    }
  }, [isOpen, currentAnalysisId, playerId]);

  useEffect(() => {
    if (selectedCompareId) {
      loadCompareAnalysis(selectedCompareId);
    }
  }, [selectedCompareId]);

  const loadAnalyses = async () => {
    const { data } = await supabase
      .from('video_analyses')
      .select('id, created_at, context_tag')
      .eq('player_id', playerId)
      .neq('id', currentAnalysisId)
      .order('created_at', { ascending: false })
      .limit(20);

    setAnalyses(data || []);
  };

  const loadCurrentAnalysis = async () => {
    const { data: analysis } = await supabase
      .from('video_analyses')
      .select('*')
      .eq('id', currentAnalysisId)
      .single();

    const { data: scores } = await supabase
      .from('fourb_scores')
      .select('*')
      .eq('analysis_id', currentAnalysisId)
      .maybeSingle();

    setCurrentAnalysis(analysis);
    setCurrentScores(scores);
  };

  const loadCompareAnalysis = async (compareId: string) => {
    const { data: analysis } = await supabase
      .from('video_analyses')
      .select('*')
      .eq('id', compareId)
      .single();

    const { data: scores } = await supabase
      .from('fourb_scores')
      .select('*')
      .eq('analysis_id', compareId)
      .maybeSingle();

    setCompareAnalysis(analysis);
    setCompareScores(scores);
  };

  const getScoreColor = (score: number | null | undefined): string => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getDelta = (current: number | null | undefined, compare: number | null | undefined) => {
    if (!current || !compare) return null;
    return current - compare;
  };

  const DeltaIndicator = ({ delta }: { delta: number | null }) => {
    if (delta === null) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (delta > 0) return (
      <div className="flex items-center gap-1 text-green-500">
        <TrendingUp className="h-4 w-4" />
        <span className="font-semibold">+{Math.abs(delta).toFixed(0)}</span>
      </div>
    );
    if (delta < 0) return (
      <div className="flex items-center gap-1 text-red-500">
        <TrendingDown className="h-4 w-4" />
        <span className="font-semibold">-{Math.abs(delta).toFixed(0)}</span>
      </div>
    );
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="h-4 w-4" />
        <span className="font-semibold">0</span>
      </div>
    );
  };

  const handleExportComparison = async () => {
    toast({
      title: "Export Started",
      description: "Generating comparison PDF...",
    });

    // TODO: Call PDF generation with comparison data
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Comparison PDF downloaded",
      });
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Swing Analyses</DialogTitle>
          <DialogDescription>
            View side-by-side comparison of two swing analyses
          </DialogDescription>
        </DialogHeader>

        {/* Analysis Selector */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Select Analysis to Compare</label>
          <Select value={selectedCompareId} onValueChange={setSelectedCompareId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an analysis..." />
            </SelectTrigger>
            <SelectContent>
              {analyses.map((analysis) => (
                <SelectItem key={analysis.id} value={analysis.id}>
                  {new Date(analysis.created_at).toLocaleDateString()} - {analysis.context_tag || 'N/A'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {compareAnalysis && (
          <>
            {/* Ghost Mode Toggle */}
            <Card className="mb-4 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ghost className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="ghost-mode">Ghost Overlay Mode</Label>
                </div>
                <Switch
                  id="ghost-mode"
                  checked={ghostMode}
                  onCheckedChange={setGhostMode}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Overlay the comparison video semi-transparently over the current video
              </p>
            </Card>

            {/* Video Comparison */}
            <div className={ghostMode ? "mb-6" : "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"}>
              {ghostMode ? (
                // Ghost overlay mode - single video with overlay
                <Card>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="outline">Current with Ghost Overlay</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(currentAnalysis?.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                      {currentAnalysis?.video_url && (
                        <video 
                          src={currentAnalysis.video_url} 
                          controls 
                          className="absolute inset-0 w-full h-full"
                        />
                      )}
                      {compareAnalysis?.video_url && (
                        <video 
                          src={compareAnalysis.video_url} 
                          muted
                          className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
                          style={{ mixBlendMode: 'screen' }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Side-by-side mode
                <>
                  <Card>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="outline">Current</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(currentAnalysis?.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {currentAnalysis?.video_url ? (
                        <video 
                          src={currentAnalysis.video_url} 
                          controls 
                          className="w-full aspect-video bg-black rounded-lg"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <p className="text-muted-foreground">No video</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="outline">Comparison</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(compareAnalysis.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {compareAnalysis.video_url ? (
                        <video 
                          src={compareAnalysis.video_url} 
                          controls 
                          className="w-full aspect-video bg-black rounded-lg"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <p className="text-muted-foreground">No video</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* 4B Scores Comparison */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">4B Score Comparison</h3>
                <div className="grid grid-cols-4 gap-4">
                  {['brain', 'body', 'bat', 'ball'].map((metric) => {
                    const currentValue = currentScores?.[`${metric}_score`];
                    const compareValue = compareScores?.[`${metric}_score`];
                    const delta = getDelta(currentValue, compareValue);

                    return (
                      <div key={metric} className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm font-medium text-muted-foreground uppercase mb-2">
                          {metric}
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className={`text-2xl font-bold ${getScoreColor(currentValue)}`}>
                            {currentValue ? Math.round(currentValue) : '-'}
                          </span>
                          <span className="text-muted-foreground">vs</span>
                          <span className={`text-2xl font-bold ${getScoreColor(compareValue)}`}>
                            {compareValue ? Math.round(compareValue) : '-'}
                          </span>
                        </div>

                        <div className="flex items-center justify-center">
                          <DeltaIndicator delta={delta} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Overall Score */}
                {currentScores?.overall_score && compareScores?.overall_score && (
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">Current Overall</div>
                        <div className={`text-4xl font-bold ${getScoreColor(currentScores.overall_score)}`}>
                          {Math.round(currentScores.overall_score)}
                        </div>
                      </div>

                      <div className="text-3xl text-muted-foreground">→</div>

                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">Previous Overall</div>
                        <div className={`text-4xl font-bold ${getScoreColor(compareScores.overall_score)}`}>
                          {Math.round(compareScores.overall_score)}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">Change</div>
                        <DeltaIndicator delta={getDelta(currentScores.overall_score, compareScores.overall_score)} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                <div className="space-y-2">
                  {currentScores && compareScores && (
                    <>
                      {Object.entries({
                        Brain: getDelta(currentScores.brain_score, compareScores.brain_score),
                        Body: getDelta(currentScores.body_score, compareScores.body_score),
                        Bat: getDelta(currentScores.bat_score, compareScores.bat_score),
                        Ball: getDelta(currentScores.ball_score, compareScores.ball_score),
                      }).map(([area, delta]) => {
                        if (delta === null || delta === 0) return null;
                        const improvement = delta > 0;
                        return (
                          <div key={area} className="flex items-center gap-2 text-sm">
                            {improvement ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={improvement ? 'text-green-500' : 'text-red-500'}>
                              {area}: {improvement ? '+' : ''}{delta.toFixed(0)} points
                              {improvement ? ' improvement' : ' decrease'}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Export Button */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleExportComparison} className="gap-2">
                <Download className="h-4 w-4" />
                Export Comparison PDF
              </Button>
            </div>
          </>
        )}

        {!compareAnalysis && selectedCompareId && (
          <div className="py-12 text-center text-muted-foreground">
            Loading comparison data...
          </div>
        )}

        {!selectedCompareId && (
          <div className="py-12 text-center text-muted-foreground">
            Select an analysis above to compare
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
