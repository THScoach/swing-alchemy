import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Flame, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function MyProgress() {
  const [stats, setStats] = useState({
    points: 0,
    level: "Bronze",
    streak: 0,
    nextMilestone: 1000
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    // TODO: Fetch actual player stats from database
    setStats({
      points: 750,
      level: "Bronze",
      streak: 7,
      nextMilestone: 1000
    });
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
        <Card>
          <CardHeader>
            <CardTitle>4B Metrics History</CardTitle>
            <CardDescription>Track your Brain, Body, Bat, and Ball scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              4B metrics chart coming soon
            </div>
          </CardContent>
        </Card>

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
