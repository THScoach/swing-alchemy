import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Upload, Clock, Brain, Target, TrendingUp, BarChart3 } from "lucide-react";

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
          <h1 className="text-4xl font-bold mb-2">Welcome to The Hitting Skool AI Training</h1>
          <p className="text-xl text-muted-foreground">
            Your swing just got smarter.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Message */}
        <Card className="border-2 border-primary mb-8">
          <CardContent className="pt-8 space-y-6">
            <p className="text-lg font-semibold text-center">
              Congrats — you&apos;re officially part of The Hitting Skool AI-Adaptive Training program.
            </p>
            
            <div className="space-y-3 text-left">
              <p className="text-base">Here&apos;s how it works:</p>
              <div className="space-y-2">
                <p><span className="font-bold">1️⃣</span> Upload your first swing (use 240 fps slow motion if possible).</p>
                <p><span className="font-bold">2️⃣</span> Coach Rick AI analyzes your tempo, rhythm, and sequence.</p>
                <p><span className="font-bold">3️⃣</span> Your Smart Drill Engine creates drills based on your swing pattern.</p>
                <p><span className="font-bold">4️⃣</span> Each upload makes your training program smarter — and your swing more efficient.</p>
              </div>
            </div>

            <p className="text-lg font-semibold text-center italic">
              This is where data meets feel.
            </p>

            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
                <Upload className="mr-2 h-5 w-5" />
                Upload My First Swing →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">What Happens After You Upload</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold">You&apos;ll receive your first AI report within 60 seconds</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Brain className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold">Your Smart Drill Engine assigns you 3 starter drills</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold">You&apos;ll unlock performance tracking (Tempo + 4B metrics)</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold">You&apos;ll get weekly challenges and progress check-ins</span>
                  </div>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground text-center mt-6">
                If you need help, text <span className="font-semibold">&quot;Smart&quot;</span> to get support or email{" "}
                <span className="font-semibold">support@thehittingskool.com</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How to Get the Most Out of It */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BarChart3 className="h-7 w-7" />
              How to Get the Most Out of It
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-bold">Train With Rhythm, Not Randomness</h3>
            <p className="text-lg">
              The best hitters train patterns, not positions.
            </p>
            <p className="text-lg">
              Upload frequently, stay consistent, and let Coach Rick AI fine-tune your timing, tempo, and rhythm automatically.
            </p>
            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/feed")} variant="outline">
                Go to My Dashboard →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <div className="text-center space-y-6 py-8">
          <div className="pt-4">
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-10">
              <Upload className="mr-2 h-5 w-5" />
              Upload My First Swing →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
