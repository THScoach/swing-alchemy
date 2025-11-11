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
    headline: "See What You're Missing",
    subheadline: "Upload one swing. Get instant AI feedback. No credit card required.",
    benefits: [
      "One free video analysis with 4B metrics",
      "View-only dashboard to see your swing data",
      "Course previews to understand the training system",
    ],
    cta: "Start Free Analysis",
    planType: "free",
  },
  "self-service": {
    name: "Remote Starter",
    price: "$29",
    period: "/mo",
    headline: "Train Smarter. Move Better. Hit Harder.",
    subheadline: "Get the same AI analysis trusted by pro hitters — without the pro price tag.",
    benefits: [
      "Instant 4B + Tempo analysis on every swing you upload",
      "Drill recommendations that match YOUR swing flaws",
      "Weekly 'Coach Rick Breakdown' videos with real coaching insights",
      "Full access to The Hitting Skool community and course library",
      "Unlimited video uploads — track your progress over time",
    ],
    cta: "Start Remote Training",
    planType: "self-service",
  },
  "group-coaching": {
    name: "Remote Hybrid Coaching",
    price: "$99",
    period: "/mo",
    headline: "Get Real Coaching. From Anywhere.",
    subheadline: "The perfect blend of AI precision and human feedback from Coach Rick.",
    benefits: [
      "Everything in Remote Starter, plus personalized coaching",
      "2 custom swing reviews per month with video feedback from Coach Rick",
      "Group coaching sessions — train with others at your level",
      "Progress reports powered by 4B + Reboot metrics",
      "Priority support when you need help",
    ],
    cta: "Join Group Coaching",
    planType: "group-coaching",
  },
  "winter-program": {
    name: "Winter Program",
    price: "$997",
    period: " one-time",
    headline: "Rebuild Your Swing. Keep It Forever.",
    subheadline: "The complete hitting transformation used with MLB hitters — now available remotely.",
    benefits: [
      "Complete biomechanical evaluation with full 4B assessment",
      "Weekly live sessions with Coach Rick for personalized feedback",
      "Fully customized training plan built around YOUR swing",
      "Final performance report showing your transformation",
      "Priority support throughout the entire program",
    ],
    cta: "Join Winter Program",
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
          </div>
        </div>
      </div>
    </>
  );
}
