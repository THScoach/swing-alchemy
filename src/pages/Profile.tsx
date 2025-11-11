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
  Calendar,
  Wrench
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EquipmentSetupModal } from "@/components/EquipmentSetupModal";

export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [equipmentProfile, setEquipmentProfile] = useState<any>(null);

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

      // Load analyses with player data
      if (playersData && playersData.length > 0) {
        const { data: analysesData } = await supabase
          .from("video_analyses")
          .select("*, players(name)")
          .in("player_id", playersData.map((p) => p.id))
          .order("created_at", { ascending: false })
          .limit(10);
        
        setAnalyses(analysesData || []);
        setAnalysisCount(analysesData?.length || 0);
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

      // Load analyses with player data
      if (playersData && playersData.length > 0) {
        const { data: analysesData } = await supabase
          .from("video_analyses")
          .select("*, players(name)")
          .in("player_id", playersData.map((p) => p.id))
          .order("created_at", { ascending: false })
          .limit(10);
        
        setAnalyses(analysesData || []);
        setAnalysisCount(analysesData?.length || 0);

        // Load equipment profile
        const { data: equipData } = await supabase
          .from("player_equipment_profile")
          .select("*")
          .eq("player_id", playersData[0].id)
          .maybeSingle();
        
        setEquipmentProfile(equipData);
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
              <Card key={stat.label} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="pt-4 text-center">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Analyses */}
        {analyses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Analyses</CardTitle>
              <CardDescription>Click any analysis to view the full report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  onClick={() => navigate(`/analyze/${analysis.id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {analysis.thumbnail_url ? (
                      <img src={analysis.thumbnail_url} alt="Analysis" className="w-full h-full object-cover" />
                    ) : (
                      <Video className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{analysis.players?.name || "Unknown Player"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {analysis.ball_scores && typeof analysis.ball_scores === 'object' && (
                      <Badge variant="outline" className="text-xs">
                        Ball: {typeof analysis.ball_scores === 'number' ? analysis.ball_scores : 
                              analysis.ball_scores.overall || 'N/A'}
                      </Badge>
                    )}
                    {analysis.bat_scores && typeof analysis.bat_scores === 'object' && (
                      <Badge variant="outline" className="text-xs">
                        Bat: {typeof analysis.bat_scores === 'number' ? analysis.bat_scores : 
                             analysis.bat_scores.overall || 'N/A'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

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
              <CardTitle className="text-lg">Equipment Setup</CardTitle>
              <CardDescription className="mt-1">
                {equipmentProfile ? "View or update your equipment" : "Tell us what equipment you use"}
              </CardDescription>
            </div>
            {!userId && (
              <Button variant="ghost" size="sm" onClick={() => setEquipmentModalOpen(true)}>
                <Wrench className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {equipmentProfile ? (
              <div className="space-y-2 text-sm">
                {equipmentProfile.swing_sensors?.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Swing Sensors: </span>
                    <span className="font-medium">{equipmentProfile.swing_sensors.join(", ")}</span>
                  </div>
                )}
                {equipmentProfile.ball_trackers?.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Ball Trackers: </span>
                    <span className="font-medium">{equipmentProfile.ball_trackers.join(", ")}</span>
                  </div>
                )}
                {equipmentProfile.motion_tools?.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Motion Tools: </span>
                    <span className="font-medium">{equipmentProfile.motion_tools.join(", ")}</span>
                  </div>
                )}
                {equipmentProfile.training_facility && (
                  <div>
                    <span className="text-muted-foreground">Facility: </span>
                    <span className="font-medium">{equipmentProfile.training_facility}</span>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setEquipmentModalOpen(true)}
              >
                Setup Equipment Profile
              </Button>
            )}
          </CardContent>
        </Card>

        {firstPlayer && (
          <EquipmentSetupModal
            open={equipmentModalOpen}
            onOpenChange={setEquipmentModalOpen}
            playerId={firstPlayer.id}
            onComplete={loadProfile}
          />
        )}

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
