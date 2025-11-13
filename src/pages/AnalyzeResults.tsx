import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle,
  Loader2,
  Download,
  GitCompare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { FourBDashboard } from "@/components/fourb/FourBDashboard";
import { AdvancedVideoPlayer } from "@/components/video/AdvancedVideoPlayer";
import { ComparisonModal } from "@/components/analysis/ComparisonModal";
import { DrillRecommendations } from "@/components/analysis/DrillRecommendations";
import { ModelRebootMetricsPanel } from "@/components/ModelRebootMetricsPanel";
import { PlayerLevel } from "@/lib/fourb/types";
import { useToast } from "@/hooks/use-toast";
import { ThreePillarScores } from "@/components/analysis/ThreePillarScores";
import { computeSwingScore } from "@/lib/analysis/scoring";
import { SwingScore } from "@/lib/analysis/types";
import { KineticSequencePanel } from "@/components/analysis/KineticSequencePanel";
import { computeKineticSequenceScore, KineticSequenceScore } from "@/lib/analysis/kineticSequenceScoring";

export default function AnalyzeResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [fourbData, setFourbData] = useState<any>({
    brain: null,
    body: null,
    bat: null,
    ball: null,
  });
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const emailTriggeredRef = useRef(false);
  const [swingScore, setSwingScore] = useState<SwingScore | null>(null);
  const [kineticScore, setKineticScore] = useState<KineticSequenceScore | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  // Auto-trigger instant progress email (idempotent per mount)
  useEffect(() => {
    if (!analysis || !analysis.id || !analysis.player_id) return;
    if (!fourbData || (!fourbData.brain && !fourbData.body && !fourbData.bat && !fourbData.ball)) return;
    if (emailTriggeredRef.current) return;

    emailTriggeredRef.current = true;

    supabase.functions
      .invoke('send-progress-email', {
        body: {
          analysisId: analysis.id,
          playerId: analysis.player_id,
        },
      })
      .then((res) => {
        if (res.error) {
          console.error('send-progress-email error:', res.error);
          emailTriggeredRef.current = false; // allow retry on reload if needed
        } else {
          console.log('send-progress-email success:', res.data);
        }
      })
      .catch((err) => {
        console.error('send-progress-email exception:', err);
        emailTriggeredRef.current = false;
      });
  }, [analysis, fourbData]);

  const fetchAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('video_analyses')
        .select('*, players(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setAnalysis(data);
      setPlayer(data.players);

      // Fetch 4B data for this specific analysis
      if (data.id) {
        const [brainRes, bodyRes, batRes, ballRes] = await Promise.all([
          supabase.from('brain_data').select('*').eq('analysis_id', data.id).maybeSingle(),
          supabase.from('body_data').select('*').eq('analysis_id', data.id).maybeSingle(),
          supabase.from('bat_data').select('*').eq('analysis_id', data.id).maybeSingle(),
          supabase.from('ball_data').select('*').eq('analysis_id', data.id).maybeSingle(),
        ]);

        setFourbData({
          brain: brainRes.data,
          body: bodyRes.data,
          bat: batRes.data,
          ball: ballRes.data,
        });

        // Compute 3-pillar swing score
        const score = computeSwingScore(
          bodyRes.data,
          batRes.data,
          ballRes.data,
          data
        );
        setSwingScore(score);

        // Store scores in database (convert to JSON for storage)
        await supabase
          .from('video_analyses')
          .update({
            anchor_score: score.anchor.score,
            stability_score: score.stability.score,
            whip_score: score.whip.score,
            overall_swing_score: score.overall,
            anchor_submetrics: JSON.parse(JSON.stringify(score.anchor.subMetrics)),
            stability_submetrics: JSON.parse(JSON.stringify(score.stability.subMetrics)),
            whip_submetrics: JSON.parse(JSON.stringify(score.whip.subMetrics)),
          } as any)
          .eq('id', data.id);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessVideo = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-video-analysis', {
        body: { 
          analysisId: id,
          mode: analysis.mode || 'player',
          level: analysis.level || player?.player_level,
          handedness: analysis.handedness || analysis.hitter_side || player?.bats,
          fps_confirmed: analysis.fps_confirmed || analysis.fps,
        }
      });

      if (error) throw error;

      // Refresh the analysis data
      await fetchAnalysis();
      
      toast({
        title: "Processing Complete!",
        description: "Your video has been analyzed and biomechanics data is now available.",
      });
    } catch (error) {
      console.error('Error processing video:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-4b-pdf', {
        body: { analysisId: id }
      });

      if (error) throw error;

      if (!data?.success || !data?.html) {
        throw new Error('Invalid response from PDF generator');
      }

      // Proper window.open implementation for cross-browser compatibility
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Pop-up Blocked",
          description: "Please allow pop-ups to view the PDF report.",
          variant: "destructive",
        });
        return;
      }

      // Write HTML properly without timing issues
      printWindow.document.open();
      printWindow.document.write(data.html);
      printWindow.document.close();

      toast({
        title: "PDF Ready",
        description: "Report opened in new tab. Use Ctrl/Cmd+P to print or save as PDF.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!analysis) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Analysis Not Found</h2>
              <p className="text-muted-foreground mb-4">
                This analysis doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => navigate('/analyze')}>
                Upload New Video
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Swing Analysis</h1>
              <p className="text-muted-foreground">
                {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setCompareModalOpen(true)}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <GitCompare className="h-4 w-4" />
                Compare
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={exportingPDF}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                {exportingPDF ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export PDF
                  </>
                )}
              </Button>
              {analysis.processing_status === 'pending' && (
                <Button 
                  onClick={handleProcessVideo}
                  disabled={processing}
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process Video'
                  )}
                </Button>
              )}
              <Badge variant={analysis.processing_status === 'completed' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                {analysis.processing_status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Advanced Video Player with Telestration */}
        {analysis.video_url && (
          <div className="mb-8">
            <AdvancedVideoPlayer 
              videoUrl={analysis.video_url}
              analysisId={analysis.id}
              showPoseOverlay={!!fourbData.body}
              skeletonData={analysis.skeleton_data}
            />
          </div>
        )}

        {/* Three Pillar Scores */}
        {swingScore && (
          <div className="mb-8">
            <ThreePillarScores swingScore={swingScore} />
          </div>
        )}

        {/* Kinematic Sequence Panel */}
        {kineticScore && (
          <div className="mb-8">
            <KineticSequencePanel sequenceScore={kineticScore} />
          </div>
        )}

        {/* Unified 4B Dashboard - No Tabs */}
        <FourBDashboard
          playerId={analysis.player_id}
          playerLevel={(player?.player_level || 'Other') as PlayerLevel}
          brainData={fourbData.brain}
          bodyData={fourbData.body}
          batData={fourbData.bat}
          ballData={fourbData.ball}
        />

        {/* Model / Reboot Metrics Panel (when available) */}
        {analysis.metrics_reboot && (
          <ModelRebootMetricsPanel
            metricsReboot={analysis.metrics_reboot}
            level={analysis.level || player?.player_level}
            handedness={analysis.handedness || player?.bats}
          />
        )}

        {/* Drill Recommendations */}
        {fourbData.brain || fourbData.body || fourbData.bat || fourbData.ball ? (
          <div className="mt-8">
            <DrillRecommendations
              fourbScores={{
                brain_score: fourbData.brain?.brain_score,
                body_score: fourbData.body?.body_score,
                bat_score: fourbData.bat?.bat_score,
                ball_score: fourbData.ball?.ball_score,
                overall_score: (fourbData.brain?.brain_score + fourbData.body?.body_score + fourbData.bat?.bat_score + fourbData.ball?.ball_score) / 4
              }}
              brainData={fourbData.brain}
              bodyData={fourbData.body}
              batData={fourbData.bat}
              ballData={fourbData.ball}
            />
          </div>
        ) : null}

        {/* Comparison Modal */}
        <ComparisonModal
          isOpen={compareModalOpen}
          onClose={() => setCompareModalOpen(false)}
          currentAnalysisId={analysis.id}
          playerId={analysis.player_id}
        />
      </div>
    </AppLayout>
  );
}
