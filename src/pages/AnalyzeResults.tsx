import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  User, 
  Activity, 
  Target, 
  Video, 
  TrendingUp, 
  AlertTriangle,
  Upload,
  Eye,
  BookOpen,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { KineticSequenceChart } from "@/components/KineticSequenceChart";
import { FourBDashboard } from "@/components/fourb/FourBDashboard";
import { PlayerLevel } from "@/lib/fourb/types";
import { CoachRickAvatar } from "@/components/CoachRickAvatar";
import { useToast } from "@/hooks/use-toast";

export default function AnalyzeResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("fourb");
  const [player, setPlayer] = useState<any>(null);
  const [fourbData, setFourbData] = useState<any>({
    brain: null,
    body: null,
    bat: null,
    ball: null,
  });

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

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
        body: { analysisId: id }
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

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return { label: "Excellent", variant: "default" as const };
    if (score >= 70) return { label: "Good", variant: "secondary" as const };
    return { label: "Needs Work", variant: "destructive" as const };
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

  const overallScore = Math.round(
    ((analysis.brain_scores || 0) + 
     (analysis.body_scores || 0) + 
     (analysis.bat_scores || 0) + 
     (analysis.ball_scores || 0)) / 4
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Swing Analysis</h1>
              <p className="text-muted-foreground">
                {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-3">
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

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="fourb">4B Dashboard</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="brain">Brain</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="bat">Bat</TabsTrigger>
            <TabsTrigger value="ball">Ball</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
          </TabsList>

          {/* 4B Dashboard Tab */}
          <TabsContent value="fourb" className="space-y-6">
            <FourBDashboard
              playerId={analysis.player_id}
              playerLevel={(player?.player_level || 'Other') as PlayerLevel}
              brainData={fourbData.brain}
              bodyData={fourbData.body}
              batData={fourbData.bat}
              ballData={fourbData.ball}
            />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative w-48 h-48">
                    <svg className="transform -rotate-90 w-48 h-48">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(overallScore / 100) * 552} 552`}
                        className="text-primary transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold">{overallScore}</span>
                      <span className="text-sm text-muted-foreground">Overall Score</span>
                    </div>
                  </div>
                  <Badge {...getScoreBadge(overallScore)} className="mt-4 text-lg px-4 py-1">
                    {getScoreBadge(overallScore).label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 4B Scores Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card 
                className="bg-gradient-to-br from-success/10 to-success/5 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedTab("brain")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-success" />
                    <CardTitle className="text-lg">Brain</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-bold ${getScoreColor(analysis.brain_scores || 0)}`}>
                        {analysis.brain_scores || 0}
                      </span>
                      <span className="text-muted-foreground">/100</span>
                    </div>
                    <Progress value={analysis.brain_scores || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground">Cognitive Processing</p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gradient-to-br from-primary/10 to-primary/5 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedTab("body")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Body</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-bold ${getScoreColor(analysis.body_scores || 0)}`}>
                        {analysis.body_scores || 0}
                      </span>
                      <span className="text-muted-foreground">/100</span>
                    </div>
                    <Progress value={analysis.body_scores || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground">Kinematic Sequence</p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gradient-to-br from-warning/10 to-warning/5 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedTab("bat")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-warning" />
                    <CardTitle className="text-lg">Bat</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-bold ${getScoreColor(analysis.bat_scores || 0)}`}>
                        {analysis.bat_scores || 0}
                      </span>
                      <span className="text-muted-foreground">/100</span>
                    </div>
                    <Progress value={analysis.bat_scores || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground">Swing Mechanics</p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gradient-to-br from-destructive/10 to-destructive/5 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedTab("ball")}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-lg">Ball</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-bold ${getScoreColor(analysis.ball_scores || 0)}`}>
                        {analysis.ball_scores || 0}
                      </span>
                      <span className="text-muted-foreground">/100</span>
                    </div>
                    <Progress value={analysis.ball_scores || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground">Contact Quality</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Strongest Area:</strong> Your {
                        Math.max(
                          analysis.brain_scores || 0,
                          analysis.body_scores || 0,
                          analysis.bat_scores || 0,
                          analysis.ball_scores || 0
                        ) === (analysis.brain_scores || 0) ? 'Brain' :
                        Math.max(
                          analysis.brain_scores || 0,
                          analysis.body_scores || 0,
                          analysis.bat_scores || 0,
                          analysis.ball_scores || 0
                        ) === (analysis.body_scores || 0) ? 'Body' :
                        Math.max(
                          analysis.brain_scores || 0,
                          analysis.body_scores || 0,
                          analysis.bat_scores || 0,
                          analysis.ball_scores || 0
                        ) === (analysis.bat_scores || 0) ? 'Bat' : 'Ball'
                      } performance is excellent. Keep reinforcing these mechanics.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Focus Area:</strong> Your {
                        Math.min(
                          analysis.brain_scores || 100,
                          analysis.body_scores || 100,
                          analysis.bat_scores || 100,
                          analysis.ball_scores || 100
                        ) === (analysis.brain_scores || 100) ? 'Brain' :
                        Math.min(
                          analysis.brain_scores || 100,
                          analysis.body_scores || 100,
                          analysis.bat_scores || 100,
                          analysis.ball_scores || 100
                        ) === (analysis.body_scores || 100) ? 'Body' :
                        Math.min(
                          analysis.brain_scores || 100,
                          analysis.body_scores || 100,
                          analysis.bat_scores || 100,
                          analysis.ball_scores || 100
                        ) === (analysis.bat_scores || 100) ? 'Bat' : 'Ball'
                      } score needs attention for balanced development.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Next Steps:</strong> Review the detailed breakdowns in each tab and follow the recommended drills.
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Training</CardTitle>
                <CardDescription>Start with these drills to improve your scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <BookOpen className="h-6 w-6 text-primary mb-2" />
                      <CardTitle className="text-sm">Hip Rotation Drill</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">
                        Improve kinematic sequence timing
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        View Course →
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <BookOpen className="h-6 w-6 text-primary mb-2" />
                      <CardTitle className="text-sm">Bat Speed Training</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">
                        Increase power generation
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        View Course →
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <BookOpen className="h-6 w-6 text-primary mb-2" />
                      <CardTitle className="text-sm">Launch Angle Drill</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">
                        Optimize contact quality
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        View Course →
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brain Tab */}
          <TabsContent value="brain" className="space-y-6">
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                <strong>S2 Cognition Integration:</strong> Upload your S2 Cognition report to see detailed Brain metrics including visual processing and action control.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>🧠 BRAIN - Cognitive Processing</CardTitle>
                <CardDescription>S2 Cognition analysis would display here</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No S2 Cognition report uploaded yet
                </p>
                <Button>Upload S2 Report</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Body Tab */}
          <TabsContent value="body" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>💪 BODY - Biomechanics & Kinematic Sequence</CardTitle>
                <CardDescription>Velocity curves showing power generation through the swing</CardDescription>
              </CardHeader>
              <CardContent>
                <KineticSequenceChart data={analysis.kinetic_sequence} />

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Tempo Ratio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">1.2</p>
                      <p className="text-xs text-muted-foreground">Optimal: 1.0-1.3</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Hip-Shoulder Separation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">45°</p>
                      <p className="text-xs text-muted-foreground">Optimal: 40-50°</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Peak Bat Speed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">72 mph</p>
                      <p className="text-xs text-muted-foreground">Good for your level</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Time to Contact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0.15s</p>
                      <p className="text-xs text-muted-foreground">Excellent timing</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bat Tab */}
          <TabsContent value="bat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>⚾ BAT - Swing Mechanics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Attack Angle</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">15°</p>
                      <p className="text-xs text-muted-foreground">Optimal: 10-20°</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Bat Speed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">72 mph</p>
                      <p className="text-xs text-muted-foreground">At contact</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Swing Length</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">6.5 ft</p>
                      <p className="text-xs text-muted-foreground">Efficient path</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ball Tab */}
          <TabsContent value="ball" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🎯 BALL - Contact Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    Connect your Pocket Radar to track exit velocity and see more detailed Ball metrics.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Exit Velocity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">Pocket Radar required</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Add Reading
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Launch Angle</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">18°</p>
                      <p className="text-xs text-muted-foreground">Estimated from video</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Playback</CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.video_url ? (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={analysis.video_url}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Coach Rick Avatar */}
      <CoachRickAvatar
        playerLevel={player?.player_level || "HS (14-18)"}
        currentTab={selectedTab === "fourb" ? "brain" : selectedTab as any}
        weakMetrics={[]}
        contextTip={
          selectedTab === "brain"
            ? "Work on cognitive training to improve pitch recognition and decision-making speed."
            : selectedTab === "body"
            ? "Focus on kinematic efficiency and movement patterns for better power transfer."
            : selectedTab === "bat"
            ? "Improve bat path mechanics and consistency for better contact quality."
            : selectedTab === "ball"
            ? "Optimize launch angles and exit velocity for better outcomes."
            : "Check out your complete 4B Dashboard to see where to focus your training."
        }
      />
    </AppLayout>
  );
}
