import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Upload, Users, Video, Calendar, Target, Zap, MessageCircle } from "lucide-react";

export default function HybridWelcome() {
  const navigate = useNavigate();

  const handleUploadSwing = () => {
    navigate("/analyze");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <div className="bg-primary/10 border-b border-primary/20 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2 text-foreground">Welcome to Hybrid Coaching</h1>
          <p className="text-xl text-muted-foreground">
            You just unlocked personal access to Coach Rick.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Hero Message */}
        <Card className="border-2 border-primary">
          <CardContent className="pt-8 space-y-4">
            <p className="text-lg font-semibold text-foreground">
              This is where your swing meets precision.
            </p>
            <p className="text-base text-foreground">
              You're now part of <strong>The Hitting Skool Hybrid Program</strong> — where AI speed meets human feedback.
            </p>
            <p className="text-base text-foreground">
              Every week, we'll break down swings live, troubleshoot movement issues, and refine your rhythm, tempo, and body control.
            </p>
            <p className="text-base text-foreground">
              Your Smart Drill Engine still runs automatically — now it's paired with <strong>direct coaching from Coach Rick</strong> to close the loop faster.
            </p>
          </CardContent>
        </Card>

        {/* Section 1: Your First 3 Steps */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center text-foreground">Your First 3 Steps</h2>
          
          <div className="grid gap-6 md:grid-cols-1">
            {/* Step 1 */}
            <Card className="border-primary/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Video className="h-6 w-6 text-primary" />
                  <span>1️⃣ Join the Live Coaching Call</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Calls every <strong>Monday at 7:00 PM CST</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Zoom Link: [Coming to your email shortly]
                </p>
                <Button size="lg" className="w-full">
                  <Calendar className="mr-2 h-5 w-5" />
                  Join Next Live Call →
                </Button>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border-primary/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Upload className="h-6 w-6 text-primary" />
                  <span>2️⃣ Upload Your Latest Swing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  We'll review it together on the next call.
                </p>
                <Button size="lg" className="w-full" onClick={handleUploadSwing}>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Swing for Review →
                </Button>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border-primary/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <span>3️⃣ Join the Private Community</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Get access to your Hybrid group, ask questions, and get drill updates.
                </p>
                <Button size="lg" className="w-full" variant="outline">
                  <Users className="mr-2 h-5 w-5" />
                  Join Hybrid Community →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 2: What You Get */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-2xl text-center">What You Get as a Hybrid Member</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-foreground">Live Weekly Q&A Calls</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-foreground">Personal 1-on-1 Video Reviews Each Month</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-foreground">AI + Human Feedback Loop</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-foreground">Priority Analysis Queue</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-foreground">Drill Progression Tracking</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-foreground">Private Hybrid Community Access</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-center text-foreground">
                <Zap className="inline h-4 w-4 mr-1" />
                You're officially part of the elite tier of The Hitting Skool.
              </p>
              <p className="text-sm text-center text-muted-foreground mt-1">
                Expect faster communication, early feature access, and real-time drill updates.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: What to Expect on Live Calls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Target className="h-6 w-6" />
              What to Expect on Live Calls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Placeholder */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
              <div className="text-center space-y-2">
                <Video className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Hybrid Call Preview Video</p>
                <p className="text-xs text-muted-foreground">(Split screen: AI metrics + live coaching)</p>
              </div>
            </div>
            
            <p className="text-lg text-center text-foreground italic">
              "During live calls, we'll go deep into rhythm, tempo, and your kinetic sequence.
            </p>
            <p className="text-lg text-center text-foreground italic">
              Expect clarity, not chaos — and actionable feedback you can apply immediately."
            </p>
          </CardContent>
        </Card>

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleUploadSwing}>
            <Upload className="mr-2 h-5 w-5" />
            Upload Your Swing
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/feed")}>
            Go to Dashboard
          </Button>
        </div>
      </div>

      {/* Support Bar */}
      <div className="bg-muted border-t border-border py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
            <MessageCircle className="h-4 w-4" />
            Need help or want to confirm your swing is queued?
          </p>
          <p className="text-sm font-semibold mt-2">
            Text <span className="text-primary">"Hybrid Help"</span> or email{" "}
            <span className="text-primary">support@thehittingskool.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
