import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link as LinkIcon, Mail, Copy, Check, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Invite {
  id: string;
  token: string;
  email: string | null;
  status: string;
  created_at: string;
  expires_at: string;
}

export default function TeamInvites() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [team, setTeam] = useState<any>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [genericLink, setGenericLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (teamId) {
      loadData();
    }
  }, [teamId]);

  const loadData = async () => {
    try {
      // Load team with member count
      const { data, error } = await supabase.functions.invoke("team-overview", {
        body: { teamId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setTeam(data.team);

      // Load invites
      const { data: invitesData, error: invitesError } = await supabase
        .from("team_invites")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (invitesError) throw invitesError;
      setInvites(invitesData || []);

      // Find a generic link if exists
      const genericInvite = invitesData?.find(inv => !inv.email && inv.status !== "expired");
      if (genericInvite) {
        const appUrl = window.location.origin;
        setGenericLink(`${appUrl}/team/join?token=${genericInvite.token}`);
      }
    } catch (error) {
      console.error("Error loading invites:", error);
      toast({
        title: "Error loading invites",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email && !playerName) {
      toast({
        title: "Email or name required",
        description: "Please enter at least an email or player name",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);

      const { data, error } = await supabase.functions.invoke("team-create-invite", {
        body: {
          teamId,
          email: email || null,
          playerName: playerName || null,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Invite created!",
        description: email 
          ? `Invitation email sent to ${email}`
          : "Share the link with your player",
      });

      setEmail("");
      setPlayerName("");
      loadData();
    } catch (error) {
      console.error("Error creating invite:", error);
      toast({
        title: "Failed to create invite",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateGenericLink = async () => {
    try {
      setCreating(true);

      const { data, error } = await supabase.functions.invoke("team-create-invite", {
        body: { teamId },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGenericLink(data.joinUrl);
      loadData();

      toast({
        title: "Link generated!",
        description: "Share this link with your players",
      });
    } catch (error) {
      console.error("Error generating link:", error);
      toast({
        title: "Failed to generate link",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "Share this link with your players",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "claimed") return <Badge variant="default">Claimed</Badge>;
    if (status === "sent") return <Badge variant="outline">Sent</Badge>;
    if (status === "expired") return <Badge variant="destructive">Expired</Badge>;
    return <Badge variant="outline">Created</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  const isExpired = team && new Date(team.expires_on) < new Date();
  const isFull = team && team.activeMembers >= team.player_limit;
  const canInvite = !isExpired && !isFull;

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(`/coach/teams/${teamId}`)} className="mb-4">
          ← Back to Team
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Invite Players</h1>
          <p className="text-muted-foreground">
            Add players to {team?.name} ({team?.activeMembers || 0} / {team?.player_limit || 10} seats used)
          </p>
          {isExpired && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive font-medium">Team access expired. Renew to unlock invites.</p>
              <Button variant="destructive" className="mt-2" onClick={() => navigate("/order-team")}>
                Renew Team Pass
              </Button>
            </div>
          )}
          {isFull && !isExpired && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg">
              <p className="text-yellow-700 dark:text-yellow-400 font-medium">All seats are full. Remove players or upgrade.</p>
            </div>
          )}
        </div>

        {/* Generic Link Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Team Join Link
            </CardTitle>
            <CardDescription>
              Share this link with multiple players. Anyone with the link can join.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {genericLink ? (
              <div className="flex gap-2">
                <Input
                  value={genericLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => handleCopy(genericLink)}
                  variant="outline"
                  size="icon"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <Button onClick={handleGenerateGenericLink} disabled={creating || !canInvite}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Generate Join Link
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Email Invite Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Invitation
            </CardTitle>
            <CardDescription>
              Send a personalized invitation email to a specific player
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Player Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="player@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="playerName">Player Name (Optional)</Label>
                <Input
                  id="playerName"
                  type="text"
                  placeholder="John Smith"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={creating || !email || !canInvite}>
                <UserPlus className="h-4 w-4 mr-2" />
                {creating ? "Sending..." : "Send Invitation"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Invites History */}
        <Card>
          <CardHeader>
            <CardTitle>Invite History</CardTitle>
            <CardDescription>
              Track all invitations sent to players
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invites.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No invites sent yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell>
                        {invite.email || <span className="text-muted-foreground">Generic link</span>}
                      </TableCell>
                      <TableCell>{getStatusBadge(invite.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invite.created_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invite.expires_at)}
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
