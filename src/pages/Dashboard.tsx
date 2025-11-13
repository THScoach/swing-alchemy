import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  GitCompare, 
  MessageSquare, 
  Video, 
  Trophy,
  Calendar as CalendarIcon,
  TrendingUp,
  CheckCircle2,
  Clock,
  Brain,
  User,
  Activity,
  Target,
  PlayCircle,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FourBHistoryChart } from "@/components/FourBHistoryChart";
import { toast } from "sonner";

interface PlayerStats {
  totalSwings: number;
  bestScore: number;
  lastTrainingDate: string | null;
}

interface DrillAssignment {
  id: string;
  title: string;
  difficulty: string;
  duration_minutes: number;
  video_url: string | null;
  completed: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [playerId, setPlayerId] = useState<string>("");
  const [stats, setStats] = useState<PlayerStats>({
    totalSwings: 0,
    bestScore: 0,
    lastTrainingDate: null
  });
  const [assignedDrills, setAssignedDrills] = useState<DrillAssignment[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [fourbScores, setFourbScores] = useState({
    body: { score: 0, state: 'no-data', hasData: false },
    brain: { score: 0, state: 'no-data', hasData: false },
    bat: { score: 0, state: 'no-data', hasData: false },
    ball: { score: 0, state: 'no-data', hasData: false }
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [coachRickPriorities, setCoachRickPriorities] = useState<string[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar')
        .eq('id', user.id)
        .single();

      if (profile) {
        setPlayerName(profile.name);
        setAvatarUrl(profile.avatar || '');
      }

      // Get player
      const { data: players } = await supabase
        .from('players')
        .select('id, has_reboot_report')
        .eq('profile_id', user.id)
        .limit(1);

      if (!players || players.length === 0) return;

      const pid = players[0].id;
      setPlayerId(pid);

      // Fetch player stats
      await Promise.all([
        fetchPlayerStats(pid),
        fetchAssignedDrills(pid),
        fetchProgressData(pid),
        fetch4BScores(pid, players[0]),
        fetchRecentActivity(pid),
        fetchCoachRickPriorities(pid)
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchPlayerStats = async (pid: string) => {
    // Get total swings from fourb_scores (which tracks sessions)
    const { count: swingCount } = await supabase
      .from('fourb_scores')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', pid);

    // Get best overall score from fourb_scores
    const { data: bestSession } = await supabase
      .from('fourb_scores')
      .select('overall_score')
      .eq('player_id', pid)
      .not('overall_score', 'is', null)
      .order('overall_score', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get last training date from fourb_scores
    const { data: lastSession } = await supabase
      .from('fourb_scores')
      .select('session_date')
      .eq('player_id', pid)
      .order('session_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    setStats({
      totalSwings: swingCount || 0,
      bestScore: bestSession?.overall_score || 0,
      lastTrainingDate: lastSession?.session_date || null
    });
  };

  const fetchAssignedDrills = async (pid: string) => {
    // Temporarily use empty array - drills will be populated from other sources
    setAssignedDrills([]);
  };

  const fetchProgressData = async (pid: string) => {
    // Get progression history for trend data
    const { data: history } = await supabase
      .from('progression_history')
      .select('date, brain_score, body_score, bat_score, ball_score, overall_4b_score')
      .eq('player_id', pid)
      .order('date', { ascending: false })
      .limit(10);

    if (history) {
      // Map to anchor/stability/whip format (use body scores as proxy)
      const mapped = history.map(h => ({
        created_at: h.date,
        anchor_score: h.body_score ? h.body_score * 0.9 : null,
        stability_score: h.body_score ? h.body_score : null,
        whip_score: h.body_score ? h.body_score * 1.1 : null
      }));
      setProgressData(mapped.reverse());
    }
  };

  const fetch4BScores = async (pid: string, playerData: any) => {
    // Get latest 4B scores
    const { data: latest4B } = await supabase
      .from('fourb_scores')
      .select('*')
      .eq('player_id', pid)
      .order('session_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const scores = {
      body: { score: 0, state: 'no-data', hasData: false },
      brain: { score: 0, state: 'no-data', hasData: false },
      bat: { score: 0, state: 'no-data', hasData: false },
      ball: { score: 0, state: 'no-data', hasData: false }
    };

    if (latest4B) {
      // Body - always available from video biomechanics
      if (latest4B.body_score !== null) {
        scores.body = {
          score: latest4B.body_score,
          state: latest4B.body_state || 'developing',
          hasData: true
        };
      }

      // Brain - only if S2 data exists
      if (latest4B.brain_score !== null) {
        scores.brain = {
          score: latest4B.brain_score,
          state: latest4B.brain_state || 'developing',
          hasData: true
        };
      }

      // Bat - from sensor data or estimation
      if (latest4B.bat_score !== null) {
        scores.bat = {
          score: latest4B.bat_score,
          state: latest4B.bat_state || 'developing',
          hasData: true
        };
      }

      // Ball - from tracking data
      if (latest4B.ball_score !== null) {
        scores.ball = {
          score: latest4B.ball_score,
          state: latest4B.ball_state || 'developing',
          hasData: true
        };
      }
    }

    setFourbScores(scores);
  };

  const fetchRecentActivity = async (pid: string) => {
    const { data: activity } = await supabase
      .from('points_history')
      .select('*')
      .eq('player_id', pid)
      .order('created_at', { ascending: false })
      .limit(5);

    setRecentActivity(activity || []);
  };

  const fetchCoachRickPriorities = async (pid: string) => {
    // Get general priorities based on player progress
    const priorities: string[] = [
      "Focus on building consistent movement patterns",
      "Work on timing and tempo in your swing",
      "Keep practicing your fundamentals daily"
    ];

    setCoachRickPriorities(priorities);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'synced': return 'text-success';
      case 'developing': return 'text-warning';
      case 'limiting': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'synced': return <Badge className="bg-success/10 text-success border-success/20">Synced</Badge>;
      case 'developing': return <Badge className="bg-warning/10 text-warning border-warning/20">Developing</Badge>;
      case 'limiting': return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Limiting</Badge>;
      default: return <Badge variant="outline">No Data</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{playerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">Welcome back, {playerName}</h1>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span>{stats.totalSwings} Total Swings</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>Best Score: {Math.round(stats.bestScore)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Last Training: {formatDate(stats.lastTrainingDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => navigate('/analyze')} 
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            <span>Upload New Swing</span>
          </Button>
          <Button 
            onClick={() => navigate('/analyze')} 
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <GitCompare className="h-5 w-5" />
            <span>Compare Swings</span>
          </Button>
          <Button 
            onClick={() => navigate('/brain')} 
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Coach Rick AI</span>
          </Button>
          <Button 
            onClick={() => navigate('/analyze')} 
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <Video className="h-5 w-5" />
            <span>View All Swings</span>
          </Button>
        </div>

        {/* Training Schedule / Prescribed Drills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Today's Training Plan
            </CardTitle>
            <CardDescription>Your assigned drills from Coach Rick AI</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedDrills.length > 0 ? (
              <div className="space-y-3">
                {assignedDrills.map((drill) => (
                  <div key={drill.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{drill.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {drill.difficulty}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {drill.duration_minutes} min
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/drills`)}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Watch
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Coach Rick AI has no assigned drills yet
                </p>
                <Button onClick={() => navigate('/analyze')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Your First Swing Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Anchor / Stability / Whip Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Biomechanics Progress
            </CardTitle>
            <CardDescription>Last 10 swings - Anchor, Stability, Whip trends</CardDescription>
          </CardHeader>
          <CardContent>
            {progressData.length > 0 ? (
              <div className="space-y-4">
                {['anchor', 'stability', 'whip'].map((metric) => {
                  const scores = progressData.map((d: any) => d[`${metric}_score`]).filter(s => s != null);
                  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                  const last = scores.length > 0 ? scores[scores.length - 1] : 0;
                  const trend = scores.length > 1 ? last - scores[0] : 0;

                  return (
                    <div key={metric} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{Math.round(avg)}</span>
                          {trend !== 0 && (
                            <Badge variant={trend > 0 ? "default" : "destructive"}>
                              {trend > 0 ? '+' : ''}{Math.round(trend)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress value={avg} className="h-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No swing data yet. Upload your first swing to see progress!
              </p>
            )}
          </CardContent>
        </Card>

        {/* 4B Score Overview */}
        <Card>
          <CardHeader>
            <CardTitle>4B System Overview</CardTitle>
            <CardDescription>Your complete player profile across all four pillars</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Body */}
              <Card className={`${fourbScores.body.hasData ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <User className={`h-5 w-5 ${fourbScores.body.hasData ? 'text-primary' : 'text-muted-foreground'}`} />
                    {getStateBadge(fourbScores.body.state)}
                  </div>
                  <CardTitle className="text-lg">Body</CardTitle>
                </CardHeader>
                <CardContent>
                  {fourbScores.body.hasData ? (
                    <div className={`text-3xl font-bold ${getStateColor(fourbScores.body.state)}`}>
                      {Math.round(fourbScores.body.score)}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Upload swing for biomechanics data
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Brain */}
              <Card className={`${fourbScores.brain.hasData ? 'bg-success/5 border-success/20' : 'bg-muted/30'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Brain className={`h-5 w-5 ${fourbScores.brain.hasData ? 'text-success' : 'text-muted-foreground'}`} />
                    {getStateBadge(fourbScores.brain.state)}
                  </div>
                  <CardTitle className="text-lg">Brain</CardTitle>
                </CardHeader>
                <CardContent>
                  {fourbScores.brain.hasData ? (
                    <div className={`text-3xl font-bold ${getStateColor(fourbScores.brain.state)}`}>
                      {Math.round(fourbScores.brain.score)}
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate('/brain')}
                    >
                      Upload S2 Report
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Bat */}
              <Card className={`${fourbScores.bat.hasData ? 'bg-warning/5 border-warning/20' : 'bg-muted/30'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Activity className={`h-5 w-5 ${fourbScores.bat.hasData ? 'text-warning' : 'text-muted-foreground'}`} />
                    {getStateBadge(fourbScores.bat.state)}
                  </div>
                  <CardTitle className="text-lg">Bat</CardTitle>
                </CardHeader>
                <CardContent>
                  {fourbScores.bat.hasData ? (
                    <div className={`text-3xl font-bold ${getStateColor(fourbScores.bat.state)}`}>
                      {Math.round(fourbScores.bat.score)}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Connect bat sensor or use estimation
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Ball */}
              <Card className={`${fourbScores.ball.hasData ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/30'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Target className={`h-5 w-5 ${fourbScores.ball.hasData ? 'text-destructive' : 'text-muted-foreground'}`} />
                    {getStateBadge(fourbScores.ball.state)}
                  </div>
                  <CardTitle className="text-lg">Ball</CardTitle>
                </CardHeader>
                <CardContent>
                  {fourbScores.ball.hasData ? (
                    <div className={`text-3xl font-bold ${getStateColor(fourbScores.ball.state)}`}>
                      {Math.round(fourbScores.ball.score)}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Add ball tracking data
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Coach Rick AI Preview */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Coach Rick's Priorities for You
            </CardTitle>
            <CardDescription>Based on your recent swings</CardDescription>
          </CardHeader>
          <CardContent>
            {coachRickPriorities.length > 0 ? (
              <ul className="space-y-2">
                {coachRickPriorities.map((priority, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{priority}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Upload a swing to get personalized coaching insights
              </p>
            )}
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/brain')}
            >
              Open Coach Rick AI
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-success/10 text-success border-success/20">
                      +{activity.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No recent activity. Start training to see your progress!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
