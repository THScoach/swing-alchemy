import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Calendar, AlertCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Team {
  id: string;
  name: string;
  player_limit: number;
  expires_on: string;
  status: string;
  created_at: string;
  _count?: {
    activeMembers: number;
  };
}

export default function Teams() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const { data: teamsData, error } = await supabase
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // For each team, get active member count
      const teamsWithCounts = await Promise.all(
        (teamsData || []).map(async (team) => {
          const { count } = await supabase
            .from("team_members")
            .select("*", { count: "exact", head: true })
            .eq("team_id", team.id)
            .eq("status", "active");

          return {
            ...team,
            _count: {
              activeMembers: count || 0,
            },
          };
        })
      );

      setTeams(teamsWithCounts);
    } catch (error) {
      console.error("Error loading teams:", error);
      toast({
        title: "Error loading teams",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (team: Team) => {
    const expiresOn = new Date(team.expires_on);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiresOn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (team.status === "canceled") {
      return <Badge variant="destructive">Canceled</Badge>;
    }

    if (expiresOn < now || team.status === "expired") {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (daysUntilExpiry <= 7) {
      return <Badge variant="outline" className="border-orange-500 text-orange-500">Expires Soon</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading your teams...</div>
        </div>
      </AppLayout>
    );
  }

  if (teams.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto py-16 px-4">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-2xl">No Teams Yet</CardTitle>
              <CardDescription>
                You don't have any active teams. Purchase a Team Pass to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/order-team")} size="lg">
                Get Team Pass
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Teams</h1>
            <p className="text-muted-foreground mt-1">
              Manage your team rosters and track player progress
            </p>
          </div>
          <Button onClick={() => navigate("/order-team")}>
            Add New Team
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const expiresOn = new Date(team.expires_on);
            const daysUntilExpiry = Math.ceil((expiresOn.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <Card
                key={team.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/coach/teams/${team.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{team.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(team)}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {team._count?.activeMembers || 0} / {team.player_limit} players
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Expires {formatDate(team.expires_on)}</span>
                  </div>
                  {daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
                    <div className="flex items-center gap-2 text-sm text-orange-500">
                      <AlertCircle className="h-4 w-4" />
                      <span>{daysUntilExpiry} days remaining</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
