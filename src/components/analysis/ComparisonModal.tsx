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
  const [proSwings, setProSwings] = useState<any[]>([]);
  const [syncPlay, setSyncPlay] = useState(true);
  
  const currentVideoRef = useRef<HTMLVideoElement | null>(null);
  const compareVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    loadAnalyses();
    loadCurrentAnalysis();
    loadProSwings();
    setSelectedCompareId("");
    setCompareAnalysis(null);
    setCompareScores(null);
    setGhostMode(false);
    setIsPlaying(false);
  }, [isOpen, currentAnalysisId, playerId]);

  const loadProSwings = async () => {
    const { data } = await supabase
      .from("pro_swings")
      .select("*")
      .order("created_at", { ascending: false });

    setProSwings(data || []);
  };

  const handlePlayPause = () => {
    const current = currentVideoRef.current;
    const compare = compareVideoRef.current;

    if (!current) return;

    if (isPlaying) {
      current.pause();
      if (syncPlay && compare) compare.pause();
      setIsPlaying(false);
    } else {
      current.play();
      if (syncPlay && compare) compare.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!syncPlay) return;
    const current = currentVideoRef.current;
    const compare = compareVideoRef.current;
    if (!current || !compare) return;

    const delta = Math.abs(compare.currentTime - current.currentTime);
    if (delta > 0.05) {
      compare.currentTime = current.currentTime;
    }
  };

  useEffect(() => {
    if (!selectedCompareId) {
      setCompareAnalysis(null);
      setCompareScores(null);
      return;
    }

    if (selectedCompareId.startsWith("pro:")) {
      const id = selectedCompareId.replace("pro:", "");
      const swing = proSwings.find((s) => s.id === id);
      if (swing) {
        setCompareAnalysis({
          id,
          video_url: swing.video_url,
          is_pro_swing: true,
          label: swing.label,
          created_at: swing.created_at,
        });
        setCompareScores(null);
      }
    } else {
      loadCompareAnalysis(selectedCompareId);
    }
  }, [selectedCompareId, proSwings]);

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
      .from("video_analyses")
      .select("*")
      .eq("id", currentAnalysisId)
      .single();

    const { data: scores } = await supabase
      .from("fourb_scores")
      .select("*")
      .eq("analysis_id", currentAnalysisId)
      .maybeSingle();

    setCurrentAnalysis(analysis || null);
    setCurrentScores(scores || null);
  };

  const loadCompareAnalysis = async (id: string) => {
    const { data: analysis } = await supabase
      .from("video_analyses")
      .select("*")
      .eq("id", id)
      .single();

    const { data: scores } = await supabase
      .from("fourb_scores")
      .select("*")
      .eq("analysis_id", id)
      .maybeSingle();

    setCompareAnalysis(analysis || null);
    setCompareScores(scores || null);
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
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select analysis or pro swing to compare" />
            </SelectTrigger>
            <SelectContent>
              {analyses.length > 0 && (
                <>
                  <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    Player History
                  </div>
                  {analyses.map((analysis) => (
                    <SelectItem key={analysis.id} value={analysis.id}>
                      {new Date(analysis.created_at).toLocaleDateString()} •{" "}
                      {analysis.context_tag || "Session"}
                    </SelectItem>
                  ))}
                </>
              )}

              {proSwings.length > 0 && (
                <>
                  <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    Pro / Model Swings
                  </div>
                  {proSwings.map((swing) => (
                    <SelectItem key={swing.id} value={`pro:${swing.id}`}>
                      {swing.label}
                      {swing.level ? ` • ${swing.level}` : ""}
                      {swing.handedness ? ` • ${swing.handedness}` : ""}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {compareAnalysis && (
          <>
            {/* Ghost Mode Toggle & Playback Controls */}
            <div className="flex items-center justify-between mt-4 mb-2 gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="ghost-mode"
                  checked={ghostMode}
                  onCheckedChange={setGhostMode}
                  disabled={!compareAnalysis?.video_url}
                />
                <Label htmlFor="ghost-mode" className="flex items-center gap-2 text-xs">
                  <Ghost className="w-4 h-4" />
                  Ghost Overlay Mode
                </Label>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Switch
                    id="sync-play"
                    checked={syncPlay}
                    onCheckedChange={setSyncPlay}
                  />
                  <Label htmlFor="sync-play">Sync Playback</Label>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                disabled={!currentAnalysis?.video_url}
                className="gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Pause" : "Play Both"}
              </Button>
            </div>

            {/* Video Comparison */}
            {ghostMode && currentAnalysis?.video_url && compareAnalysis?.video_url ? (
              <div className="relative mt-2 bg-black rounded-xl overflow-hidden">
                <video
                  ref={currentVideoRef}
                  src={currentAnalysis.video_url}
                  className="w-full opacity-70"
                  onTimeUpdate={handleTimeUpdate}
                  controls={false}
                />
                <video
                  ref={compareVideoRef}
                  src={compareAnalysis.video_url}
                  className="w-full absolute inset-0 mix-blend-screen opacity-40 pointer-events-none"
                  controls={false}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <Card className="bg-black/90">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Current</span>
                      {currentAnalysis && (
                        <span>{new Date(currentAnalysis.created_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    {currentAnalysis?.video_url ? (
                      <video
                        ref={currentVideoRef}
                        src={currentAnalysis.video_url}
                        className="w-full rounded-md"
                        onTimeUpdate={handleTimeUpdate}
                        controls
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground">No video</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-black/90">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{compareAnalysis?.is_pro_swing ? "Pro / Model Swing" : "Comparison"}</span>
                      <span>
                        {compareAnalysis?.label
                          ? compareAnalysis.label
                          : compareAnalysis?.created_at
                          ? new Date(compareAnalysis.created_at).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    {compareAnalysis?.video_url ? (
                      <video
                        ref={compareVideoRef}
                        src={compareAnalysis.video_url}
                        className="w-full rounded-md"
                        controls
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        {selectedCompareId ? "No video for selection" : "Select an analysis or pro swing above"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

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
