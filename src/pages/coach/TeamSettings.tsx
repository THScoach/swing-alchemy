import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save } from "lucide-react";

export default function TeamSettings() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    if (teamId) {
      loadTeam();
    }
  }, [teamId]);

  const loadTeam = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      if (error) throw error;

      setTeam(data);
      setTeamName(data.name);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const { error } = await supabase
        .from("teams")
        .update({ name: teamName })
        .eq("id", teamId);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Team settings have been updated successfully",
      });

      navigate(`/coach/teams/${teamId}`);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Failed to save settings",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading settings...</div>
        </div>
      </AppLayout>
    );
  }

  if (!team) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <p>Team not found</p>
        </div>
      </AppLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const daysUntilExpiry = team ? Math.ceil((new Date(team.expires_on).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(`/coach/teams/${teamId}`)} className="mb-4">
          ← Back to Team
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Team Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your team preferences
          </p>
          {isExpiringSoon && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg">
              <p className="text-yellow-700 dark:text-yellow-400 font-medium">
                ⚠️ Team access expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
              </p>
              <Button variant="outline" className="mt-2" onClick={() => navigate("/order-team")}>
                Renew Team Pass
              </Button>
            </div>
          )}
          {isExpired && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive font-medium">Team access expired. Renew to unlock features.</p>
              <Button variant="destructive" className="mt-2" onClick={() => navigate("/order-team")}>
                Renew Team Pass
              </Button>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic information about your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>

              <div className="space-y-2">
                <Label>Team ID</Label>
                <Input
                  value={team.id}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  This is your unique team identifier
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>
                Your team access information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Player Limit</Label>
                  <p className="text-2xl font-bold">{team.player_limit}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="text-2xl font-bold capitalize">{team.status}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Expires On</Label>
                <p className="text-lg font-medium">{formatDate(team.expires_on)}</p>
                {daysUntilExpiry > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {daysUntilExpiry} days remaining
                  </p>
                )}
                {daysUntilExpiry <= 0 && (
                  <p className="text-sm text-destructive mt-1">
                    Expired
                  </p>
                )}
              </div>

              {(isExpiringSoon || isExpired) && (
                <div className="pt-4">
                  <Button
                    onClick={() => navigate("/order-team")}
                    variant={isExpired ? "destructive" : "outline"}
                    className="w-full"
                  >
                    Renew Team Pass
                  </Button>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="text-sm">{formatDate(team.created_at)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" disabled={saving || teamName === team.name}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/coach/teams/${teamId}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
