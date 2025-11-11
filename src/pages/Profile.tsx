import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Bell, 
  LogOut, 
  Edit, 
  Video,
  Wrench,
  Upload,
  ArrowLeft,
  Brain as BrainIcon,
  Activity,
  Zap,
  Target
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EquipmentSetupModal } from "@/components/EquipmentSetupModal";
import { CoachUploadModal } from "@/components/CoachUploadModal";
import { cn } from "@/lib/utils";

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
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>("");
  const [isCoachOrAdmin, setIsCoachOrAdmin] = useState(false);
  const [fourbScores, setFourbScores] = useState<any>(null);
  const [contextFilter, setContextFilter] = useState<string>("All");

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

      setIsCoachOrAdmin(true);

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

        // Load latest 4B scores
        const { data: fourbData } = await supabase
          .from("fourb_scores")
          .select("*")
          .eq("player_id", playersData[0].id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        setFourbScores(fourbData);
      }
    } else {
      // User viewing their own profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if current user is coach or admin
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      
      setIsCoachOrAdmin(!!isAdmin);

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

        // Load latest 4B scores
        const { data: fourbData } = await supabase
          .from("fourb_scores")
          .select("*")
          .eq("player_id", playersData[0].id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        setFourbScores(fourbData);

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
  const initials = profile.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "U";

  const getScoreColor = (score: number | null | undefined): string => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number | null | undefined): string => {
    if (!score) return "bg-muted/20";
    if (score >= 80) return "bg-green-500/10 border-green-500/20";
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  const getTierLabel = (tier: string | null | undefined): string => {
    if (!tier || tier === "free") return "Free";
    if (tier === "self_service") return "Self-Service";
    if (tier === "group") return "Group";
    if (tier === "one_on_one") return "1-on-1";
    if (tier === "team") return "Team";
    if (tier === "enterprise") return "Enterprise";
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    if (contextFilter === "All") return true;
    return analysis.context_tag === contextFilter.toLowerCase();
  });

  const fourbTiles = [
    {
      icon: BrainIcon,
      label: "Brain",
      score: fourbScores?.brain_score,
      state: fourbScores?.brain_state || "No Data",
      color: "text-purple-500"
    },
    {
      icon: Activity,
      label: "Body",
      score: fourbScores?.body_score,
      state: fourbScores?.body_state || "No Data",
      color: "text-blue-500"
    },
    {
      icon: Zap,
      label: "Bat",
      score: fourbScores?.bat_score,
      state: fourbScores?.bat_state || "No Data",
      color: "text-amber-500"
    },
    {
      icon: Target,
      label: "Ball",
      score: fourbScores?.ball_score,
      state: fourbScores?.ball_state || "No Data",
      color: "text-green-500"
    }
  ];

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          {userId && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/admin/players")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          )}
          {isCoachOrAdmin && userId && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Admin View
            </Badge>
          )}
        </div>

        {/* Player Header */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>{firstPlayer?.sport || "Baseball"}</span>
                  {firstPlayer?.bats && (
                    <>
                      <span>•</span>
                      <span>Bats: {firstPlayer.bats}</span>
                    </>
                  )}
                  {firstPlayer?.throws && (
                    <>
                      <span>•</span>
                      <span>Throws: {firstPlayer.throws}</span>
                    </>
                  )}
                  {firstPlayer?.player_level && (
                    <>
                      <span>•</span>
                      <span>{firstPlayer.player_level}</span>
                    </>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {getTierLabel(profile.subscription_tier)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4B Overview Strip */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4B Performance Overview</CardTitle>
            <CardDescription>
              {fourbScores ? "Latest assessment scores" : "Upload a swing to see your 4B scores"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {fourbTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <div
                    key={tile.label}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                      getScoreBgColor(tile.score)
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn("h-5 w-5", tile.color)} />
                      <span className="font-semibold text-sm">{tile.label}</span>
                    </div>
                    <div className={cn("text-3xl font-bold mb-1", getScoreColor(tile.score))}>
                      {tile.score ? Math.round(tile.score) : "-"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {tile.state}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Swing Analyses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-3">
              <div>
                <CardTitle className="text-lg">Recent Swing Analyses</CardTitle>
                <CardDescription>
                  {analyses.length > 0 ? "Click any analysis to view the full 4B report" : "No analyses yet"}
                </CardDescription>
              </div>
              {(isCoachOrAdmin || !userId) && firstPlayer && (
                <Button
                  onClick={() => {
                    setSelectedPlayerId(firstPlayer.id);
                    setSelectedPlayerName(firstPlayer.name);
                    setUploadModalOpen(true);
                  }}
                  size="sm"
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Swing
                </Button>
              )}
            </div>
            
            {/* Context Filters */}
            {analyses.length > 0 && (
              <Tabs value={contextFilter} onValueChange={setContextFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="All">All</TabsTrigger>
                  <TabsTrigger value="Game">Game</TabsTrigger>
                  <TabsTrigger value="Practice">Practice</TabsTrigger>
                  <TabsTrigger value="Drill">Drill</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </CardHeader>
          
          {filteredAnalyses.length > 0 ? (
            <CardContent className="space-y-3">
              {filteredAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  onClick={() => navigate(`/analyze/${analysis.id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <div className="h-14 w-14 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {analysis.thumbnail_url ? (
                      <img src={analysis.thumbnail_url} alt="Analysis" className="w-full h-full object-cover" />
                    ) : (
                      <Video className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{analysis.players?.name || "Unknown Player"}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                      {analysis.context_tag && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {analysis.context_tag}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {analysis.brain_scores && (
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", 
                        getScoreBgColor(typeof analysis.brain_scores === 'number' ? analysis.brain_scores : analysis.brain_scores?.overall))}>
                        B
                      </div>
                    )}
                    {analysis.body_scores && (
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", 
                        getScoreBgColor(typeof analysis.body_scores === 'number' ? analysis.body_scores : analysis.body_scores?.overall))}>
                        Bo
                      </div>
                    )}
                    {analysis.bat_scores && (
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", 
                        getScoreBgColor(typeof analysis.bat_scores === 'number' ? analysis.bat_scores : analysis.bat_scores?.overall))}>
                        Ba
                      </div>
                    )}
                    {analysis.ball_scores && (
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", 
                        getScoreBgColor(typeof analysis.ball_scores === 'number' ? analysis.ball_scores : analysis.ball_scores?.overall))}>
                        Bl
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          ) : (
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {contextFilter === "All" 
                    ? "No analyses yet. Upload your first swing to get started!" 
                    : `No ${contextFilter.toLowerCase()} analyses found`}
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Player Info & Equipment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Player Info */}
          {firstPlayer && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Player Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {firstPlayer.position && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position</span>
                    <span className="font-medium">{firstPlayer.position}</span>
                  </div>
                )}
                {firstPlayer.date_of_birth && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age</span>
                    <span className="font-medium">
                      {new Date().getFullYear() - new Date(firstPlayer.date_of_birth).getFullYear()}
                    </span>
                  </div>
                )}
                {firstPlayer.height && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Height</span>
                    <span className="font-medium">
                      {Math.floor(firstPlayer.height / 12)}'{firstPlayer.height % 12}"
                    </span>
                  </div>
                )}
                {firstPlayer.organization && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organization</span>
                    <span className="font-medium">{firstPlayer.organization}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Equipment */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">Equipment Setup</CardTitle>
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
                      <span className="text-muted-foreground block mb-1">Swing Sensors</span>
                      <div className="flex flex-wrap gap-1">
                        {equipmentProfile.swing_sensors.map((sensor: string) => (
                          <Badge key={sensor} variant="secondary" className="text-xs">
                            {sensor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {equipmentProfile.ball_trackers?.length > 0 && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Ball Trackers</span>
                      <div className="flex flex-wrap gap-1">
                        {equipmentProfile.ball_trackers.map((tracker: string) => (
                          <Badge key={tracker} variant="secondary" className="text-xs">
                            {tracker}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {equipmentProfile.training_facility && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Facility</span>
                      <span className="font-medium">{equipmentProfile.training_facility}</span>
                    </div>
                  )}
                  {(!equipmentProfile.swing_sensors?.length && 
                    !equipmentProfile.ball_trackers?.length && 
                    !equipmentProfile.training_facility) && (
                    <p className="text-muted-foreground text-xs">No equipment configured</p>
                  )}
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => setEquipmentModalOpen(true)}
                >
                  Setup Equipment
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {firstPlayer && (
          <EquipmentSetupModal
            open={equipmentModalOpen}
            onOpenChange={setEquipmentModalOpen}
            playerId={firstPlayer.id}
            onComplete={loadProfile}
          />
        )}

        {selectedPlayerId && (
          <CoachUploadModal
            open={uploadModalOpen}
            onOpenChange={setUploadModalOpen}
            playerId={selectedPlayerId}
            playerName={selectedPlayerName}
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
