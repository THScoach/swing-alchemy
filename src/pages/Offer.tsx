import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Video, ArrowLeft } from "lucide-react";
import { BookingModal } from "@/components/BookingModal";
import { useState } from "react";

interface PlanConfig {
  name: string;
  price: string;
  period?: string;
  headline: string;
  subheadline: string;
  videoUrl?: string;
  benefits: string[];
  cta: string;
  planType: string;
  sessionType?: string;
}

const planConfigs: Record<string, PlanConfig> = {
  "free-tempo": {
    name: "Free Tempo Analysis",
    price: "$0",
    headline: "Unlock Your Swing's Timing — Instantly.",
    subheadline: "Upload one swing and get a free AI Tempo & Load–Fire analysis in seconds.",
    benefits: [
      "Find out if your swing's rhythm matches elite hitters",
      "Get a personalized tempo ratio (Load : Fire)",
      "Receive one actionable tip to improve timing today",
    ],
    cta: "Start My Free Tempo Analysis",
    planType: "free",
  },
  "self-service": {
    name: "Self-Service",
    price: "$29",
    period: "/mo",
    headline: "Train Smarter. Every Swing, Analyzed by AI.",
    subheadline: "Get instant feedback, weekly swing reports, and community access — anywhere in the world.",
    benefits: [
      "Unlimited swing uploads with THS AI feedback",
      "Access to Swing Rehab OS courses & drills",
      "Private community for questions, progress, and wins",
    ],
    cta: "Join for $29 / month",
    planType: "self-service",
  },
  "group-coaching": {
    name: "Group Coaching",
    price: "$99",
    period: "/mo",
    headline: "Join the Team. Weekly Coaching & Accountability.",
    subheadline: "Work directly with Coach Rick and a community of driven players chasing the same goal.",
    benefits: [
      "Weekly live Zoom training sessions",
      "Personalized drill feedback and group Q&A",
      "Priority video analysis inside the app",
    ],
    cta: "Join the Group for $99 / month",
    planType: "group-coaching",
  },
  "one-on-one": {
    name: "1-on-1 Coaching",
    price: "$299",
    period: "/mo",
    headline: "Personal Coaching. Professional Results.",
    subheadline: "Get Coach Rick's direct feedback on your swing, mechanics, and training plan.",
    benefits: [
      "Private video feedback within 48 hours",
      "Monthly 1-on-1 Zoom check-in",
      "Custom drill plan built for your movement profile",
    ],
    cta: "Apply for 1-on-1 Coaching",
    planType: "one-on-one",
  },
  "team": {
    name: "Team Plan",
    price: "$499",
    period: "/mo",
    headline: "Train Your Entire Team with AI Precision.",
    subheadline: "Centralize swing data, manage rosters, and develop hitters faster.",
    benefits: [
      "Unlimited player profiles with analytics dashboard",
      "Coach portal for swing comparison & reports",
      "Monthly performance summary for every athlete",
    ],
    cta: "Get Team Access",
    planType: "team",
  },
  "winter-program": {
    name: "Winter Program",
    price: "$997",
    period: " one-time",
    headline: "The Complete Winter Training System for Hitters.",
    subheadline: "A full off-season program combining AI swing analysis, personalized feedback, and live coaching with Coach Rick.",
    benefits: [
      "Comprehensive 4B + Tempo evaluation",
      "Weekly assignments and private video feedback",
      "Exclusive Winter access — graduates continue at $99/mo if desired",
    ],
    cta: "Reserve My Winter Spot for $997",
    planType: "winter-program",
  },
  "4b-evaluation": {
    name: "4B Evaluation",
    price: "$299",
    period: " one-time",
    headline: "Know Exactly What to Fix",
    subheadline: "Complete in-lab assessment with lab-grade precision equipment.",
    benefits: [
      "90-minute comprehensive 4B evaluation in our Fenton, MO facility",
      "Brain, Body, Bat, Ball measurement with professional equipment",
      "Full 4B report with video breakdown and next-step training plan",
      "Lab-grade precision — the same tech used by pro organizations",
    ],
    cta: "Book Your Evaluation",
    planType: "in-person",
    sessionType: "4b-evaluation",
  },
};

export default function Offer() {
  const { plan } = useParams<{ plan: string }>();
  const navigate = useNavigate();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  if (!plan || !planConfigs[plan]) {
    navigate("/pricing");
    return null;
  }

  const config = planConfigs[plan];

  const handleCTA = () => {
    if (config.sessionType) {
      // In-person sessions use booking modal
      setBookingModalOpen(true);
    } else if (config.planType === "free") {
      // Free plan goes to auth/signup
      navigate("/auth");
    } else {
      // Paid plans go to auth for now (will integrate Stripe checkout next)
      navigate("/auth");
    }
  };

  return (
    <>
      <BookingModal 
        open={bookingModalOpen} 
        onOpenChange={setBookingModalOpen}
        sessionType={config.sessionType || ""}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/pricing")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pricing
          </Button>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column: Copy & Benefits */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  {config.name}
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  {config.headline}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {config.subheadline}
                </p>
              </div>

              {/* Video Placeholder */}
              <Card className="overflow-hidden border-2">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {config.videoUrl ? (
                    <iframe
                      src={config.videoUrl}
                      className="w-full h-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center space-y-2">
                      <Video className="h-16 w-16 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Video coming soon</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Benefits List */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">What You Get:</h2>
                <ul className="space-y-3">
                  {config.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-success" />
                      </div>
                      <span className="text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mobile CTA */}
              <div className="lg:hidden">
                <Card className="border-2 border-primary shadow-xl">
                  <CardContent className="p-8 space-y-6 text-center">
                    <div>
                      <div className="text-5xl font-bold text-primary mb-2">
                        {config.price}
                        {config.period && (
                          <span className="text-2xl text-muted-foreground">{config.period}</span>
                        )}
                      </div>
                      <p className="text-muted-foreground">Start training today</p>
                    </div>
                    <Button 
                      size="lg" 
                      className="w-full text-lg h-14"
                      onClick={handleCTA}
                    >
                      {config.cta}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {config.planType === "free" 
                        ? "No credit card required" 
                        : "Secure checkout powered by Stripe"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column: Pricing Card (Desktop) */}
            <div className="hidden lg:block sticky top-8">
              <Card className="border-2 border-primary shadow-xl">
                <CardContent className="p-8 space-y-6 text-center">
                  <div>
                    <div className="text-5xl font-bold text-primary mb-2">
                      {config.price}
                      {config.period && (
                        <span className="text-2xl text-muted-foreground">{config.period}</span>
                      )}
                    </div>
                    <p className="text-muted-foreground">Start training today</p>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full text-lg h-14"
                    onClick={handleCTA}
                  >
                    {config.cta}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {config.planType === "free" 
                      ? "No credit card required" 
                      : "Secure checkout powered by Stripe"}
                  </p>
                  
                  {/* Trust Indicators */}
                  <div className="pt-6 border-t space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-muted-foreground">Cancel anytime</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-muted-foreground">Trusted by pro hitters</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-muted-foreground">30-day money-back guarantee</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="bg-muted/50 py-16 mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl font-bold">
              You don't need more swings. You need better feedback.
            </h2>
            <p className="text-xl text-muted-foreground">
              Start today and know exactly what's holding your swing back.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 h-14"
              onClick={handleCTA}
            >
              {config.cta}
            </Button>
            
            {/* AI Learning Message */}
            <div className="pt-8 border-t border-border mt-12">
              <p className="text-muted-foreground italic">
                Every swing you upload helps THS AI learn your movement and tempo — the more you train, the smarter your analysis becomes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
