import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Upload, Calendar, ArrowLeft, Copy, Users } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);
  const [smsSent, setSmsSent] = useState(false);
  const [team, setTeam] = useState<any>(null);
  const [joinLink, setJoinLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [teamMembers, setTeamMembers] = useState(0);

  const sessionId = searchParams.get("session_id");
  const plan = searchParams.get("plan");
  const type = searchParams.get("type");
  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    if (type === "team" && sessionId) {
      // For team purchases, poll for team creation
      pollForTeam();
    } else if (sessionId && transactionId) {
      processPaymentSuccess();
    } else {
      navigate("/");
    }
  }, [sessionId, transactionId, type]);

  const pollForTeam = async () => {
    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: teams } = await supabase
          .from("teams")
          .select("*, team_invites(token)")
          .eq("coach_user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (teams && teams.length > 0) {
          const latestTeam = teams[0];
          setTeam(latestTeam);

          // Get member count
          const { count } = await supabase
            .from("team_members")
            .select("*", { count: "exact", head: true })
            .eq("team_id", latestTeam.id);
          
          setTeamMembers(count || 0);

          // Get join link from invite
          const inviteToken = latestTeam.team_invites?.[0]?.token;
          if (inviteToken) {
            const appUrl = window.location.origin;
            setJoinLink(`${appUrl}/team/join?token=${inviteToken}`);
          }

          setLoading(false);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          setLoading(false);
          toast.error("Team creation is taking longer than expected. Please check your coach dashboard.");
        }
      } catch (error) {
        console.error("Error polling for team:", error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setLoading(false);
        }
      }
    };

    poll();
  };

  const processPaymentSuccess = async () => {
    try {
      console.log("Processing payment success:", { sessionId, transactionId });

      // Fetch transaction details
      const { data: txn, error: txnError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (txnError) {
        console.error("Transaction fetch error:", txnError);
        throw txnError;
      }

      setTransaction(txn);

      // Update transaction status to completed
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ 
          payment_status: "completed",
          stripe_payment_intent_id: sessionId 
        })
        .eq("id", transactionId);

      if (updateError) {
        console.error("Transaction update error:", updateError);
      }

      // Check if we need to auto-create account
      const metadata = txn.metadata as Record<string, any> | null;
      const shouldCreateAccount = metadata?.createAccount === "true";
      
      if (shouldCreateAccount && txn.customer_email) {
        console.log("Auto-creating account for:", txn.customer_email);
        // Account will be created when user clicks "Create My Account" button
        // This gives them control over password creation
      }

      // Send confirmation SMS
      if (txn.customer_phone && !smsSent) {
        try {
          const { data: smsData, error: smsError } = await supabase.functions.invoke("send-booking-sms", {
            body: {
              transactionId: txn.id,
              recipientPhone: txn.customer_phone,
              recipientEmail: txn.customer_email,
              playerName: txn.customer_name,
              sessionType: txn.session_type,
              scheduledDate: txn.scheduled_date,
              messageType: "confirmation",
            },
          });

          if (smsError) {
            console.error("SMS error:", smsError);
            toast.error("Payment confirmed, but SMS notification failed");
          } else {
            console.log("SMS sent:", smsData);
            setSmsSent(true);
            toast.success("Payment confirmed! Check your phone for details.");
          }
        } catch (smsError) {
          console.error("SMS send error:", smsError);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("There was an issue processing your payment");
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {type === "team" ? "Setting up your team..." : "Processing your payment..."}
          </p>
        </div>
      </div>
    );
  }

  // Team Purchase Success
  if (type === "team" && team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/coach/teams")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Coach Dashboard
          </Button>

          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl">🎯 Your Team Is Activated!</CardTitle>
              <CardDescription className="text-lg">
                Welcome to The Hitting Skool Coach Dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Team Details */}
              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Team Name:</span>
                    <span className="font-medium">{team.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Members:</span>
                    <span className="font-medium">{teamMembers} / {team.player_limit} players</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="font-medium">
                      {new Date(team.expires_on).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">Active</span>
                  </div>
                </div>
              </div>

              {/* Join Link */}
              {joinLink && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Share Your Team Join Link</h3>
                  <p className="text-sm text-muted-foreground">
                    Send this link to your players so they can join your team
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={joinLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      size="icon"
                      className="flex-shrink-0"
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="space-y-4">
                <h3 className="font-semibold">Next Steps</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Share the Join Link</p>
                      <p className="text-sm text-muted-foreground">
                        Send the link above to your players via email or team chat
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Manage Your Team</p>
                      <p className="text-sm text-muted-foreground">
                        Track player progress and manage invites from your coach dashboard
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Players Upload & Train</p>
                      <p className="text-sm text-muted-foreground">
                        Once joined, players can upload swings and access training
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => navigate(`/coach/teams/${team.id}`)}
                  className="gap-2"
                  size="lg"
                >
                  <Users className="h-4 w-4" />
                  View Team
                </Button>
                <Button
                  onClick={() => navigate(`/coach/teams/${team.id}/invites`)}
                  variant="outline"
                  className="gap-2"
                  size="lg"
                >
                  <Users className="h-4 w-4" />
                  Invite Players
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground pt-4">
                Questions? Contact us at support@4bhitting.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for booking with The Hitting Skool
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {transaction && (
              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-lg">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session Type:</span>
                    <span className="font-medium">{transaction.session_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium">{transaction.plan_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-medium text-primary">${transaction.amount}</span>
                  </div>
                  {transaction.scheduled_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scheduled:</span>
                      <span className="font-medium">
                        {new Date(transaction.scheduled_date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmation Email:</span>
                    <span className="font-medium">{transaction.customer_email}</span>
                  </div>
                  {smsSent && (
                    <div className="flex justify-between text-green-600">
                      <span>SMS Confirmation:</span>
                      <span className="font-medium">✓ Sent</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Create Your Account</p>
                    <p className="text-sm text-muted-foreground">
                      Set up your account to access your personalized training dashboard
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Upload Your First Swing</p>
                    <p className="text-sm text-muted-foreground">
                      Get instant AI analysis and see your 4B metrics
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Start Training</p>
                    <p className="text-sm text-muted-foreground">
                      Follow your personalized training plan and track progress
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Creation CTA */}
            {transaction && (transaction.metadata as Record<string, any>)?.createAccount === "true" && (
              <Card className="bg-primary text-primary-foreground border-0">
                <CardContent className="p-6 text-center space-y-3">
                  <h3 className="text-xl font-bold">Welcome to The Hitting Skool!</h3>
                  <p className="opacity-90">
                    Create your account now to access your training dashboard
                  </p>
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => navigate(`/auth?email=${transaction?.customer_email || ''}&name=${transaction?.customer_name || ''}`)}
                    className="w-full"
                  >
                    Create My Account
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => navigate("/analyze")} className="flex-1 gap-2">
                <Upload className="h-4 w-4" />
                Upload Video
              </Button>
              <Button onClick={() => navigate("/calendar")} variant="outline" className="flex-1 gap-2">
                <Calendar className="h-4 w-4" />
                View Calendar
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground pt-4">
              Questions? Contact us at support@thehittingskool.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
