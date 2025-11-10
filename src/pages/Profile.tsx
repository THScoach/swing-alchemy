import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  Bell, 
  LogOut, 
  Edit, 
  Bluetooth,
  Video,
  BookOpen,
  Calendar
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisCount, setAnalysisCount] = useState(0);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    
    if (userId) {
      // Admin viewing another user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if current user is admin
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (!isAdmin) {
        navigate("/profile");
        return;
      }

      // Load the target user's profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(profileData);

      // Load players for this profile
      const { data: playersData } = await supabase
        .from("players")
        .select("*")
        .eq("profile_id", userId);

      setPlayers(playersData || []);

      // Count analyses
      if (playersData && playersData.length > 0) {
        const { count } = await supabase
          .from("video_analyses")
          .select("*", { count: "exact", head: true })
          .in("player_id", playersData.map((p) => p.id));
        setAnalysisCount(count || 0);
      }
    } else {
      // User viewing their own profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Load players for this profile
      const { data: playersData } = await supabase
        .from("players")
        .select("*")
        .eq("profile_id", user.id);

      setPlayers(playersData || []);

      // Count analyses
      if (playersData && playersData.length > 0) {
        const { count } = await supabase
          .from("video_analyses")
          .select("*", { count: "exact", head: true })
          .in("player_id", playersData.map((p) => p.id));
        setAnalysisCount(count || 0);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="p-4">
          <Card>
            <CardContent className="pt-6">
              <p>Profile not found</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const firstPlayer = players[0];
  const stats = [
    { label: "Analyses", value: analysisCount, icon: Video },
    { label: "Courses", value: 0, icon: BookOpen },
    { label: "Training Days", value: 0, icon: Calendar },
  ];

  const initials = profile.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "U";

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        {userId && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/admin/players")}
            className="mb-2"
          >
            ← Back to Admin
          </Button>
        )}
        
        {/* Profile Header */}
        <Card className="border-none shadow-none bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                <p className="text-muted-foreground mb-2">
                  {firstPlayer?.sport || "Baseball"} • {profile.dominant_hand || "Right"} Handed
                </p>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  {profile.subscription_tier || "Free"} Member
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-4 text-center">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Player Info */}
        {firstPlayer && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg">Player Info</CardTitle>
              {!userId && (
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sport</span>
                <span className="font-medium">{firstPlayer.sport || "Baseball"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Position</span>
                <span className="font-medium">{firstPlayer.position || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bats</span>
                <span className="font-medium">{firstPlayer.bats || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Height</span>
                <span className="font-medium">
                  {firstPlayer.height ? `${Math.floor(firstPlayer.height / 12)}'${firstPlayer.height % 12}"` : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pocket Radar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-lg">Pocket Radar</CardTitle>
              <CardDescription className="mt-1">Last synced 2 hours ago</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              <Bluetooth className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Sync Device
            </Button>
          </CardContent>
        </Card>

        {/* Settings - Only show for own profile */}
        {!userId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <Settings className="mr-3 h-5 w-5" />
                App Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="lg">
                <Bell className="mr-3 h-5 w-5" />
                Notifications
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" 
                size="lg"
                onClick={() => navigate("/auth")}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
