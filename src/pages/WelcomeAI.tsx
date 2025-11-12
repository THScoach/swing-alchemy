import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Upload, Brain, Target, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function WelcomeAI() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    // Simulate processing (in reality, this would be handled by webhook)
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    navigate("/analyze");
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <h2 className="text-xl font-semibold">Setting up your account...</h2>
              <p className="text-muted-foreground">
                We're activating your AI training and preparing your dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <div className="bg-success/10 border-b border-success/20 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Welcome to The Hitting Skool!</h1>
          <p className="text-xl text-muted-foreground">
            Your AI-Adaptive Training is now active.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Message */}
        <Card className="border-2 border-primary mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              🚀 You're All Set — Let's Get Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-center">
              Coach Rick AI is ready to analyze your swing. Upload your first video to get instant feedback on your tempo, sequence, and mechanics.
            </p>
            <div className="flex justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
                <Upload className="mr-2 h-5 w-5" />
                Upload Your First Swing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">What Happens Next?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">1. Upload Your Swing</h3>
                  <p className="text-sm text-muted-foreground">
                    Record a video from your phone or upload an existing one. Side view works best.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">2. Get AI Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Coach Rick AI analyzes your tempo, sequence, and biomechanics in under 60 seconds.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">3. Start Your Drills</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow your personalized drill recommendations and watch them adapt as you improve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Smart Training Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Your Smart Training Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <span><strong>Tempo & Sequence Analysis:</strong> See exactly how your rhythm and timing compare to elite hitters</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <span><strong>Smart Drill Engine:</strong> Your drill recommendations automatically evolve based on your progress</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <span><strong>Progress Tracking:</strong> Watch your metrics improve over time with detailed charts and insights</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <span><strong>Weekly Challenges:</strong> Stay accountable with milestone goals and achievement badges</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center space-y-4 py-8">
          <h3 className="text-xl font-semibold">Need Help Getting Started?</h3>
          <p className="text-muted-foreground">
            Text "SMART" to get instant support or email support@thehittingskool.com
          </p>
          <div className="pt-4">
            <Button size="lg" onClick={handleGetStarted} variant="default">
              Let's Go — Upload First Swing →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
