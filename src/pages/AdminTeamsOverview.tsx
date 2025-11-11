import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Users } from "lucide-react";

export default function AdminTeamsOverview() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teamsData, setTeamsData] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: hasAdminRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!hasAdminRole) {
      navigate("/feed");
      return;
    }

    setIsAdmin(true);
    loadTeamsData();
  };

  const loadTeamsData = async () => {
    setLoading(true);
    
    const { data: teams } = await supabase
      .from('teams')
      .select('*')
      .order('name');

    if (!teams) {
      setLoading(false);
      return;
    }

    // For each team, calculate stats
    const teamsWithStats = await Promise.all(
      teams.map(async (team) => {
        // Get all players on this team
        const { data: players } = await supabase
          .from('players')
          .select('id')
          .eq('team_id', team.id);

        const playerIds = players?.map(p => p.id) || [];
        const playerCount = playerIds.length;

        if (playerCount === 0) {
          return {
            ...team,
            playerCount: 0,
            avgScores: null,
            recentAnalysisRate: 0,
            playersWithData: []
          };
        }

        // Get latest 4B scores for each player
        const { data: latestScores } = await supabase
          .from('fourb_scores')
          .select('player_id, overall_score, brain_score, body_score, bat_score, ball_score, session_date')
          .in('player_id', playerIds)
          .order('session_date', { ascending: false });

        // Get unique latest score per player
        const playerLatestScores = new Map();
        latestScores?.forEach(score => {
          if (!playerLatestScores.has(score.player_id)) {
            playerLatestScores.set(score.player_id, score);
          }
        });

        const scoresArray = Array.from(playerLatestScores.values());
        
        // Calculate averages
        const avgScores = {
          overall: scoresArray.reduce((sum, s) => sum + (s.overall_score || 0), 0) / (scoresArray.length || 1),
          brain: scoresArray.reduce((sum, s) => sum + (s.brain_score || 0), 0) / (scoresArray.length || 1),
          body: scoresArray.reduce((sum, s) => sum + (s.body_score || 0), 0) / (scoresArray.length || 1),
          bat: scoresArray.reduce((sum, s) => sum + (s.bat_score || 0), 0) / (scoresArray.length || 1),
          ball: scoresArray.reduce((sum, s) => sum + (s.ball_score || 0), 0) / (scoresArray.length || 1),
        };

        // Calculate % with recent analysis (last 14 days)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const recentCount = scoresArray.filter(s => 
          s.session_date && new Date(s.session_date) > fourteenDaysAgo
        ).length;
        const recentAnalysisRate = playerCount > 0 ? (recentCount / playerCount) * 100 : 0;

        return {
          ...team,
          playerCount,
          avgScores: scoresArray.length > 0 ? avgScores : null,
          recentAnalysisRate,
          playersWithData: scoresArray.length
        };
      })
    );

    setTeamsData(teamsWithStats);
    setLoading(false);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => navigate("/admin")}
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </button>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Teams Overview</h1>
            <p className="text-muted-foreground">Performance snapshot across all teams</p>
          </div>

          {teamsData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
                <p className="text-muted-foreground">
                  Create teams to organize players and track team performance
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {teamsData.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{team.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {team.playerCount} players • {team.playersWithData} with 4B data
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Recent Activity</div>
                        <div className="text-2xl font-bold">
                          {Math.round(team.recentAnalysisRate)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          last 14 days
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {team.avgScores ? (
                      <div className="grid grid-cols-5 gap-4">
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <div className="text-xs font-medium text-muted-foreground uppercase mb-2">
                            Overall
                          </div>
                          <div className={`text-3xl font-bold ${getScoreColor(team.avgScores.overall)}`}>
                            {Math.round(team.avgScores.overall)}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <div className="text-xs font-medium text-muted-foreground uppercase mb-2">
                            Brain
                          </div>
                          <div className={`text-3xl font-bold ${getScoreColor(team.avgScores.brain)}`}>
                            {Math.round(team.avgScores.brain)}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <div className="text-xs font-medium text-muted-foreground uppercase mb-2">
                            Body
                          </div>
                          <div className={`text-3xl font-bold ${getScoreColor(team.avgScores.body)}`}>
                            {Math.round(team.avgScores.body)}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <div className="text-xs font-medium text-muted-foreground uppercase mb-2">
                            Bat
                          </div>
                          <div className={`text-3xl font-bold ${getScoreColor(team.avgScores.bat)}`}>
                            {Math.round(team.avgScores.bat)}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <div className="text-xs font-medium text-muted-foreground uppercase mb-2">
                            Ball
                          </div>
                          <div className={`text-3xl font-bold ${getScoreColor(team.avgScores.ball)}`}>
                            {Math.round(team.avgScores.ball)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No 4B data available for this team yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
