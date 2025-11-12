import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MarketingLayout } from "@/components/MarketingLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function TeamJoin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid invite link");
      setLoading(false);
      return;
    }

    checkInvite();
  }, [token]);

  const checkInvite = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to auth with return URL
        const returnUrl = window.location.href;
        navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }

      // Validate invite token
      const { data: invite, error: inviteError } = await supabase
        .from("team_invites")
        .select("*, teams(*)")
        .eq("token", token)
        .single();

      if (inviteError || !invite) {
        setError("Invalid or expired invite link");
        return;
      }

      if (invite.status === "claimed") {
        setError("This invite has already been used");
        return;
      }

      if (invite.status === "expired" || new Date(invite.expires_at) < new Date()) {
        setError("This invite has expired");
        return;
      }

      if (new Date(invite.teams.expires_on) < new Date()) {
        setError("Team access has expired");
        return;
      }

      setTeamName(invite.teams.name);
    } catch (error) {
      console.error("Error checking invite:", error);
      setError("Failed to load invite details");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!token) return;

    try {
      setClaiming(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("team-claim", {
        body: { token },
      });

      if (error) throw error;

      if (data.error) {
        setError(data.error);
        return;
      }

      setSuccess(true);
      setTeamName(data.teamName);

      toast({
        title: "Welcome to the team!",
        description: `You've successfully joined ${data.teamName}`,
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/my-progress");
      }, 2000);
    } catch (error) {
      console.error("Error claiming invite:", error);
      setError(error instanceof Error ? error.message : "Failed to join team");
      toast({
        title: "Failed to join team",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <MarketingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading invite details...</p>
            </CardContent>
          </Card>
        </div>
      </MarketingLayout>
    );
  }

  if (success) {
    return (
      <MarketingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Welcome to {teamName}!</CardTitle>
              <CardDescription>
                You've successfully joined the team. Redirecting to your dashboard...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-center">
                  You now have access to:
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>⚾ The Hitting Skool Community</li>
                  <li>⚾ 4B Biomechanics Training</li>
                  <li>⚾ Player Progress Tracking</li>
                  <li>⚾ Personalized Drill Recommendations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </MarketingLayout>
    );
  }

  if (error) {
    return (
      <MarketingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Unable to Join Team</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")} className="w-full">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Users className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">Join {teamName}</CardTitle>
            <CardDescription>
              You've been invited to join this team on The Hitting Skool
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">You'll get access to:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>The Hitting Skool Community</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>4B Biomechanics Training System</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Player Progress Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Personalized Drill Recommendations</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleClaim}
              disabled={claiming}
              size="lg"
              className="w-full"
            >
              {claiming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining Team...
                </>
              ) : (
                "Accept Invitation & Join Team"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By joining, you agree to The Hitting Skool's Terms of Service
            </p>
          </CardContent>
        </Card>
      </div>
    </MarketingLayout>
  );
}
