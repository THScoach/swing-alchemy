import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Brain, User, Target, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export default function Feed() {
  const navigate = useNavigate();
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedData();
  }, []);

  const fetchFeedData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's latest analysis
      const { data: playerData } = await supabase
        .from('players')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (playerData) {
        const { data: analysisData } = await supabase
          .from('video_analyses')
          .select('*')
          .eq('player_id', playerData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        setLatestAnalysis(analysisData);
      }

      // Fetch featured courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .limit(6)
        .order('created_at', { ascending: false });

      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching feed data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  // Check if it's Sunday (day for Check-In reminder)
  const isSunday = new Date().getDay() === 0;

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        {/* Weekly Check-In Banner (Sunday Only) */}
        {isSunday && (
          <Card className="mb-6 bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Weekly Check-In Due</CardTitle>
                    <CardDescription>Complete before Monday Zoom session</CardDescription>
                  </div>
                </div>
                <Button onClick={() => navigate("/team")}>
                  Complete Now
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Recent Achievement Banner */}
        <Card className="mb-6 bg-gradient-to-r from-green-500/20 to-green-600/10 border-green-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">🎉 Achievement Unlocked!</CardTitle>
                <CardDescription>You earned 100 THS Points for uploading your swing</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Upload CTA Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border-primary/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Start Analyzing Your Swing</CardTitle>
            <CardDescription className="text-base">
              Upload a video to get instant feedback on your hitting mechanics using the 4B Framework
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/analyze")} 
              className="w-full md:w-auto"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Upload New Video
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Latest Analysis Card */}
          {latestAnalysis ? (
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Your Latest Analysis</CardTitle>
                    <CardDescription>
                      {formatDistanceToNow(new Date(latestAnalysis.created_at), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {latestAnalysis.processing_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Brain Score</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={latestAnalysis.brain_scores || 0} className="flex-1" />
                      <span className={`text-lg font-bold ${getScoreColor(latestAnalysis.brain_scores || 0)}`}>
                        {latestAnalysis.brain_scores || 0}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Body Score</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={latestAnalysis.body_scores || 0} className="flex-1" />
                      <span className={`text-lg font-bold ${getScoreColor(latestAnalysis.body_scores || 0)}`}>
                        {latestAnalysis.body_scores || 0}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Bat Score</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={latestAnalysis.bat_scores || 0} className="flex-1" />
                      <span className={`text-lg font-bold ${getScoreColor(latestAnalysis.bat_scores || 0)}`}>
                        {latestAnalysis.bat_scores || 0}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Ball Score</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={latestAnalysis.ball_scores || 0} className="flex-1" />
                      <span className={`text-lg font-bold ${getScoreColor(latestAnalysis.ball_scores || 0)}`}>
                        {latestAnalysis.ball_scores || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/analyze/${latestAnalysis.id}`)}
                >
                  View Full Analysis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="lg:col-span-2 border-dashed">
              <CardHeader>
                <CardTitle className="text-xl">No Analyses Yet</CardTitle>
                <CardDescription>
                  Upload your first swing video to get started with AI-powered analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate("/analyze")} 
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Upload First Video
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Analyses</span>
                <span className="text-2xl font-bold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Streak</span>
                <span className="text-2xl font-bold">0 🔥</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Courses Completed</span>
                <span className="text-2xl font-bold">0/{courses.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training Content Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Training Content</h2>
            <Button variant="ghost" onClick={() => navigate("/courses")}>
              View All
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-muted rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Card 
                  key={course.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        {course.thumbnail_url ? (
                          <img 
                            src={course.thumbnail_url} 
                            alt={course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Play className="h-8 w-8 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="mb-1 text-xs">
                          {course.level}
                        </Badge>
                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{course.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                        {course.duration_minutes && (
                          <p className="text-xs text-primary mt-1">
                            {course.duration_minutes} min
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No training content available yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
