import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain as BrainIcon, Upload, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BrainCategory {
  name: string;
  key: string;
  score: number;
  description: string;
}

interface BrainTestData {
  id: string;
  player_id: string;
  processing_speed: number | null;
  tracking_focus: number | null;
  impulse_control: number | null;
  decision_making: number | null;
  overall_percentile: number | null;
  s2_report_url: string | null;
  created_at: string;
}

const Brain = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const playerId = searchParams.get("playerId");
  const [brainData, setBrainData] = useState<BrainTestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchBrainData();
    checkAdminStatus();
  }, [playerId]);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const fetchBrainData = async () => {
    try {
      setLoading(true);
      if (!playerId) {
        toast.error("No player selected");
        return;
      }

      const { data, error } = await supabase
        .from('brain_data')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setBrainData(data);
    } catch (error) {
      console.error('Error fetching brain data:', error);
      toast.error("Failed to load brain data");
    } finally {
      setLoading(false);
    }
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return "Elite";
    if (score >= 80) return "Above Average";
    if (score >= 70) return "Average";
    if (score >= 60) return "Below Average";
    return "Needs Development";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getBarColor = (score: number): string => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  // Map 8 cognitive categories
  const categories: BrainCategory[] = [
    {
      name: "Perception Speed",
      key: "processing_speed",
      score: brainData?.processing_speed || 0,
      description: "Processes pitch info quickly — gives you more reaction time."
    },
    {
      name: "Trajectory Prediction",
      key: "tracking_focus",
      score: brainData?.tracking_focus || 0,
      description: "Tracks ball path and predicts location accurately."
    },
    {
      name: "Impulse Control",
      key: "impulse_control",
      score: brainData?.impulse_control || 0,
      description: "Discipline to lay off bad pitches and control chase rate."
    },
    {
      name: "Stopping Control",
      key: "impulse_control",
      score: brainData?.impulse_control || 0,
      description: "Ability to check swing on borderline pitches."
    },
    {
      name: "Timing Control",
      key: "decision_making",
      score: brainData?.decision_making || 0,
      description: "Syncs body movements with pitch timing."
    },
    {
      name: "Rhythm Control",
      key: "decision_making",
      score: brainData?.decision_making || 0,
      description: "Maintains consistent pre-pitch routine and tempo."
    },
    {
      name: "Distraction Control",
      key: "tracking_focus",
      score: brainData?.tracking_focus || 0,
      description: "Stays locked in under pressure and noise."
    },
    {
      name: "Instinctive Learning",
      key: "overall_percentile",
      score: brainData?.overall_percentile || 0,
      description: "Adapts quickly to new pitchers and sequences."
    }
  ];

  // Calculate strengths and focus areas
  const sortedCategories = [...categories].sort((a, b) => b.score - a.score);
  const strengths = sortedCategories.slice(0, 2);
  const focusAreas = sortedCategories.slice(-2).reverse();

  const overallScore = brainData?.overall_percentile || 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <BrainIcon className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading brain data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BrainIcon className="h-8 w-8 text-primary" />
              Brain – S2 Cognition
            </h1>
            {brainData ? (
              <p className="text-sm text-muted-foreground mt-1">
                Last Test: {new Date(brainData.created_at).toLocaleDateString()} | Provider: S2 Cognition
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">No S2 data yet</p>
            )}
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        {!brainData ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <BrainIcon className="h-16 w-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold">No S2 Test on File Yet</h3>
                {isAdmin ? (
                  <p className="text-muted-foreground">
                    Upload an S2 report to begin cognitive analysis
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Ask Coach Rick how to get tested
                  </p>
                )}
                {isAdmin && (
                  <div className="flex gap-3 justify-center pt-4">
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload S2 Report
                    </Button>
                    <Button variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Order S2 Test
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle>Overall S2 Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(overallScore / 100) * 351.86} 351.86`}
                        className={getScoreColor(overallScore)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{Math.round(overallScore)}</span>
                      <span className="text-xs text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-2xl font-semibold ${getScoreColor(overallScore)}`}>
                      {getScoreLabel(overallScore)}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Cognitive processing for game-speed decisions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 8 Core Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Cognitive Categories</CardTitle>
                <CardDescription>Performance breakdown across 8 key areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {categories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <span className={`font-bold ${getScoreColor(category.score)}`}>
                        {Math.round(category.score)}
                      </span>
                    </div>
                    <Progress 
                      value={category.score} 
                      className={cn("h-3", {
                        "[&>div]:bg-success": category.score >= 80,
                        "[&>div]:bg-warning": category.score >= 60 && category.score < 80,
                        "[&>div]:bg-destructive": category.score < 60,
                      })}
                    />
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strengths & Focus Areas */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <TrendingUp className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {strengths.map((cat) => (
                    <div key={cat.name} className="space-y-1">
                      <p className="font-medium">
                        {cat.name} ({Math.round(cat.score)})
                      </p>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <TrendingDown className="h-5 w-5" />
                    Focus Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {focusAreas.map((cat) => (
                    <div key={cat.name} className="space-y-1">
                      <p className="font-medium">
                        {cat.name} ({Math.round(cat.score)})
                      </p>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recommended Training */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Training</CardTitle>
                <CardDescription>Brain-focused drills to improve cognitive performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                  <p className="font-medium">Pitch Recognition Drills</p>
                  <p className="text-sm text-muted-foreground">Improve perception speed and trajectory prediction</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                  <p className="font-medium">Decision Making Exercises</p>
                  <p className="text-sm text-muted-foreground">Enhance impulse control and stopping control</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                  <p className="font-medium">Timing & Rhythm Training</p>
                  <p className="text-sm text-muted-foreground">Build consistency in timing and rhythm control</p>
                </div>
              </CardContent>
            </Card>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex gap-3">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New S2 Report
                </Button>
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Order S2 Test
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Brain;
