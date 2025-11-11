import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Flame, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FourBHistoryChart } from "@/components/FourBHistoryChart";

export default function MyProgress() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    points: 0,
    level: "Bronze",
    streak: 0,
    nextMilestone: 1000
  });
  const [fourbHistory, setFourbHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get player
      const { data: players } = await supabase
        .from('players')
        .select('id')
        .eq('profile_id', user.id)
        .limit(1);
      
      if (players && players.length > 0) {
        const playerId = players[0].id;

        // Get points
        const { data: points } = await supabase
          .from('player_points')
          .select('*')
          .eq('player_id', playerId)
          .maybeSingle();
        
        if (points) {
          const levelThresholds = { Bronze: 1000, Silver: 2500, Gold: 5000, Platinum: 10000 };
          const nextLevel = points.level === 'Bronze' ? 'Silver' :
                           points.level === 'Silver' ? 'Gold' :
                           points.level === 'Gold' ? 'Platinum' : 'Hall of Fame';
          const nextMilestone = levelThresholds[nextLevel as keyof typeof levelThresholds] || 15000;
          
          setStats({
            points: points.balance,
            level: points.level,
            streak: points.streak,
            nextMilestone
          });
        }

        // Get 4B history from fourb_scores table
        const { data: fourbData } = await supabase
          .from('fourb_scores')
          .select('*')
          .eq('player_id', playerId)
          .order('session_date', { ascending: false })
          .limit(20);
        
        if (fourbData && fourbData.length > 0) {
          setFourbHistory(fourbData.map(score => ({
            date: score.session_date || score.created_at,
            brain_score: score.brain_score,
            body_score: score.body_score,
            bat_score: score.bat_score,
            ball_score: score.ball_score,
            overall_score: score.overall_score
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const progressPercent = (stats.points / stats.nextMilestone) * 100;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Progress</h1>
          <p className="text-muted-foreground">Track your journey to becoming an elite hitter</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">THS Points</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.points}</div>
              <p className="text-xs text-muted-foreground">
                {stats.nextMilestone - stats.points} to next level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.level}</div>
              <Progress value={progressPercent} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streak} days</div>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">4B Improvements</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* 4B History Graph */}
        <FourBHistoryChart 
          data={fourbHistory} 
          onUploadClick={() => navigate('/analyze')}
        />

        {/* Game Plans History */}
        <Card>
          <CardHeader>
            <CardTitle>Game-Plan History</CardTitle>
            <CardDescription>View your generated game-plans and opponent prep</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              No game-plans generated yet. Generate your first one in the Analyze tab.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
