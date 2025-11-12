import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Link as LinkIcon, Settings, BarChart3, UserPlus, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TeamData {
  team: {
    id: string;
    name: string;
    player_limit: number;
    expires_on: string;
    status: string;
    days_until_expiry: number;
  };
  seatsUsed: number;
  seatsRemaining: number;
  roster: Array<{
    id: string;
    player_name: string;
    player_email: string;
    status: string;
    joined_at: string | null;
  }>;
}

export default function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      loadTeamData();
    }
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("team-overview", {
        body: { teamId },
      });

      if (error) throw error;
      setTeamData(data);
    } catch (error) {
      console.error("Error loading team:", error);
      toast({
        title: "Error loading team",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not yet";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") return <Badge variant="default">active</Badge>;
    if (status === "removed") return <Badge variant="destructive">removed</Badge>;
    return <Badge variant="outline">invited</Badge>;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading team details...</div>
        </div>
      </AppLayout>
    );
  }

  if (!teamData) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <p>Team not found</p>
              <Button onClick={() => navigate("/coach/teams")} className="mt-4">
                Back to Teams
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const { team, seatsUsed, seatsRemaining, roster } = teamData;

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/coach/teams")} className="mb-4">
            ← Back to Teams
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {seatsUsed} / {team.player_limit} players
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Expires {formatDate(team.expires_on)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/coach/teams/${teamId}/invites`)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Players
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/coach/teams/${teamId}/settings`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Expiry Warning */}
        {team.days_until_expiry <= 7 && team.days_until_expiry > 0 && (
          <Card className="mb-6 border-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-500">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  Your team access expires in {team.days_until_expiry} days
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Renew soon to keep your team's access and progress
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{seatsUsed}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {seatsRemaining} seats remaining
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/coach/teams/${teamId}/invites`)}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Invite Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Generate Invite
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/coach/teams/${teamId}/reports`)}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Team Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Progress
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Roster Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Roster</CardTitle>
            <CardDescription>
              Manage your team members and track their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roster.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No players yet</p>
                <Button onClick={() => navigate(`/coach/teams/${teamId}/invites`)}>
                  Invite Your First Player
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.player_name || "Pending"}
                      </TableCell>
                      <TableCell>{member.player_email}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(member.joined_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
