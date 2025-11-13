import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Trophy, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CheckInModal } from "@/components/CheckInModal";
import { useNavigate } from "react-router-dom";

export default function Feed() {
  const navigate = useNavigate();

  // Redirect to the new Dashboard
  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [playerId, setPlayerId] = useState<string>("");
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchFeedData();
  }, []);

  const fetchFeedData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: players } = await supabase
        .from('players')
        .select('id')
        .eq('profile_id', user.id)
        .limit(1);
      
      if (players && players.length > 0) {
        const pid = players[0].id;
        setPlayerId(pid);

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        
        const { data: checkIn } = await supabase
          .from('weekly_checkins')
          .select('id')
          .eq('player_id', pid)
          .eq('week_start', weekStart.toISOString().split('T')[0])
          .maybeSingle();
        
        setHasCheckedIn(!!checkIn);

        const { data: pointsHistory } = await supabase
          .from('points_history')
          .select('*')
          .eq('player_id', pid)
          .order('created_at', { ascending: false })
          .limit(5);
        
        setRecentActivity(pointsHistory || []);
      }
    } catch (error) {
      console.error('Error fetching feed data:', error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Feed</h1>
          <p className="text-muted-foreground">Your activity and notifications</p>
        </div>

        {!hasCheckedIn && playerId && new Date().getDay() === 0 && (
          <Card className="bg-primary/10 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Check-In Due
              </CardTitle>
              <CardDescription>Complete before Monday Zoom session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setCheckInModalOpen(true)}>
                Complete Check-In
              </Button>
            </CardContent>
          </Card>
        )}

        {recentActivity.map((activity) => (
          <Card key={activity.id} className="bg-success/10 border-success">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {activity.action}
              </CardTitle>
              <CardDescription>+{activity.points} THS Points</CardDescription>
            </CardHeader>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate("/analyze")} 
              className="w-full"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Upload New Swing
            </Button>
          </CardContent>
        </Card>
      </div>

      <CheckInModal
        open={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        playerId={playerId}
        onSuccess={fetchFeedData}
      />
    </AppLayout>
  );
}
