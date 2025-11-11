import { MarketingLayout } from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Check, X, MapPin } from "lucide-react";
import { useState } from "react";
import { BookingModal } from "@/components/BookingModal";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Try before you buy",
    offerPath: "/offer/free-tempo",
    features: [
      { text: "1 video upload (lifetime)", included: true },
      { text: "View-only 4B dashboard", included: true },
      { text: "Course previews", included: true },
      { text: "Full 4B analysis", included: false },
      { text: "S2 Cognition upload", included: false },
      { text: "Pocket Radar integration", included: false },
      { text: "Group Zoom calls", included: false },
      { text: "1-on-1 Zoom calls", included: false },
      { text: "Team dashboard", included: false },
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Remote Starter",
    price: "$29",
    period: "/mo",
    description: "Fix your swing fast — without overpaying for lessons",
    offerPath: "/offer/self-service",
    features: [
      { text: "Instant 4B + Tempo analysis", included: true },
      { text: "Drill recommendations that match your swing", included: true },
      { text: "Weekly 'Coach Rick Breakdown' videos", included: true },
      { text: "Access to The Hitting Skool community", included: true },
      { text: "Full course access", included: true },
      { text: "Unlimited video uploads", included: true },
      { text: "Group coaching sessions", included: false },
      { text: "1-on-1 coaching calls", included: false },
      { text: "Team dashboard", included: false },
    ],
    cta: "Start Remote Training",
    highlighted: false,
  },
  {
    name: "Remote Hybrid Coaching",
    price: "$99",
    period: "/mo",
    description: "Train with Coach Rick — anywhere in the world",
    offerPath: "/offer/group-coaching",
    features: [
      { text: "Everything in Remote Starter", included: true },
      { text: "2 personalized swing reviews per month", included: true },
      { text: "Custom drills + video feedback from Coach Rick", included: true },
      { text: "Group coaching sessions", included: true },
      { text: "Progress reports powered by 4B + Reboot metrics", included: true },
      { text: "Priority support", included: true },
      { text: "Private 1-on-1 calls", included: false },
      { text: "Team dashboard", included: false },
    ],
    cta: "Select Plan",
    highlighted: false,
  },
  {
    name: "Winter Program",
    price: "$997",
    period: " one-time",
    description: "Full-access training experience — the complete hitting transformation used with pro players",
    offerPath: "/offer/winter-program",
    features: [
      { text: "Complete biomechanical evaluation", included: true },
      { text: "Weekly live sessions with Coach Rick", included: true },
      { text: "Fully personalized training plan", included: true },
      { text: "Final swing performance report", included: true },
      { text: "Direct messaging access", included: true },
      { text: "Priority support throughout program", included: true },
      { text: "Team dashboard", included: false },
    ],
    cta: "Join Winter Program",
    highlighted: true,
  },
  {
    name: "1-on-1 Coaching",
    price: "$299",
    period: "/mo",
    description: "Personal coaching with professional results",
    offerPath: "/offer/one-on-one",
    features: [
      { text: "Everything in Group Coaching", included: true },
      { text: "Private video feedback within 48 hours", included: true },
      { text: "Monthly 1-on-1 Zoom check-in", included: true },
      { text: "Custom drill plan for your movement profile", included: true },
      { text: "Direct messaging with Coach Rick", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Apply for 1-on-1",
    highlighted: false,
  },
  {
    name: "Team",
    price: "$499",
    period: "/mo",
    description: "For coaches & teams",
    offerPath: "/offer/team",
    features: [
      { text: "Unlimited player profiles", included: true },
      { text: "Coach portal with analytics dashboard", included: true },
      { text: "Team analytics and reports", included: true },
      { text: "Bulk video uploads", included: true },
      { text: "Leaderboards", included: true },
      { text: "Monthly performance summaries", included: true },
      { text: "Add Group Coaching (+$200/mo)", included: true },
    ],
    cta: "Get Team Access",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    offerPath: "/contact",
    features: [
      { text: "Everything in Team", included: true },
      { text: "Multiple teams", included: true },
      { text: "White-label options", included: true },
      { text: "API access", included: true },
      { text: "Dedicated support", included: true },
      { text: "Custom integrations", included: true },
      { text: "Custom billing", included: true },
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const inPersonTiers = [
  {
    name: "4B Elite Evaluation",
    price: "$299",
    period: " one-time",
    description: "Complete in-lab assessment",
    features: [
      "90-minute in-lab assessment",
      "Brain, Body, Bat, Ball measurement",
      "Full 4B report with video summary",
      "Next-step training plan",
      "Lab-grade precision equipment"
    ],
    sessionType: "4b-evaluation"
  },
  {
    name: "4B Training Pods",
    price: "$399",
    period: "/mo",
    description: "Small-group training rotation",
    features: [
      "Small-group (3 athletes) pods",
      "Sessions every 30 minutes",
      "STACK training block",
      "Mobility & movement work",
      "Tempo & ball data tracking",
      "3-month minimum commitment"
    ],
    sessionType: "pod",
    highlighted: true
  },
  {
    name: "Hybrid Add-On",
    price: "+$99",
    period: "/mo",
    description: "Remote + in-person combo",
    features: [
      "Remote video feedback",
      "In-app progress tracking",
      "Data syncs to 4B dashboard",
      "Between-session support",
      "Requires Pod or 1-on-1 plan"
    ],
    sessionType: "hybrid-addon"
  },
  {
    name: "4B Evaluation",
    price: "$299",
    period: " one-time",
    description: "Standalone in-person analysis or program onboarding",
    features: [
      "Full 4B evaluation",
      "Comprehensive assessment report",
      "Video breakdown session",
      "Personalized game plan",
      "Lab-grade precision equipment"
    ],
    sessionType: "4b-evaluation-standalone"
  },
  {
    name: "Private 1-on-1",
    price: "$125",
    period: "/hr",
    description: "Individual tune-up session",
    features: [
      "One-hour in-lab session",
      "Personalized attention",
      "Real-time adjustments",
      "Requires prior 4B Evaluation",
      "À la carte booking"
    ],
    sessionType: "private-session"
  }
];

export default function PricingPage() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSessionType, setSelectedSessionType] = useState<string>("");

  const handleBookSession = (sessionType: string) => {
    setSelectedSessionType(sessionType);
    setBookingModalOpen(true);
  };
  return (
    <MarketingLayout>
      <BookingModal 
        open={bookingModalOpen} 
        onOpenChange={setBookingModalOpen}
        sessionType={selectedSessionType}
      />

      {/* Header */}
      <section className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">Train from Anywhere. Fix Your Swing Forever.</h1>
          <p className="text-xl text-secondary-foreground/90 max-w-2xl mx-auto">
            Upload your swing. Get instant feedback. Learn exactly what's holding you back — and what to fix next.
          </p>
          <p className="text-lg text-secondary-foreground/80 max-w-3xl mx-auto mt-4 italic">
            Every swing you upload helps The Hitting Skool's AI learn your movement patterns. 
            The smarter it gets, the better your drill recommendations become.
          </p>
        </div>
      </section>

      {/* Remote Training Tiers */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Remote Training Plans</h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            Get real data, drills, and AI feedback that tells you what's wrong and how to fix it.
          </p>
          <div className="grid lg:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`flex flex-col ${
                  tier.highlighted
                    ? "border-primary border-2 shadow-xl relative"
                    : ""
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground">{tier.period}</span>
                    )}
                  </div>
                  <CardDescription className="text-base mt-2">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to={tier.offerPath} className="w-full">
                    <Button
                      className="w-full"
                      variant={tier.highlighted ? "default" : "outline"}
                      size="lg"
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* In-Person & Hybrid Training */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">In-Person & Hybrid Training</h2>
            </div>
            <p className="text-muted-foreground text-lg mb-2">
              The Hitting Skool Lab – Fenton, MO
            </p>
            <p className="text-foreground text-lg font-medium">
              Prefer live training? Or have a full team? Book in-person sessions powered by the same 4B system.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {inPersonTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`flex flex-col ${
                  tier.highlighted
                    ? "border-primary border-2 shadow-xl relative"
                    : ""
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <CardDescription className="text-base mt-2">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleBookSession(tier.sessionType)}
                  >
                    Book Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Blocks */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Train In-Person?</h3>
                <p className="mb-6 opacity-90">
                  Get started with a complete 4B evaluation at our Fenton, MO facility
                </p>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => handleBookSession("4b-evaluation")}
                  className="w-full"
                >
                  Book Your 4B Evaluation
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-secondary text-secondary-foreground">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Can't Make It to Fenton?</h3>
                <p className="mb-6 opacity-90">
                  You don't need more swings. You need better feedback. Start today for $29 and know exactly what's holding your swing back.
                </p>
                <Link to="/offer/self-service" className="block">
                  <Button size="lg" variant="outline" className="w-full">
                    Start Remote Training
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Full Feature Comparison</h2>
          <div className="bg-background rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  {tiers.map((tier) => (
                    <th key={tier.name} className="p-4 text-center font-semibold min-w-[120px]">
                      {tier.name}
                    </th>
                  ))}
                  <th className="p-4 text-center font-semibold min-w-[120px]">In-Person / Hybrid</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">Video Uploads</td>
                  <td className="p-4 text-center">1</td>
                  <td className="p-4 text-center">Unlimited</td>
                  <td className="p-4 text-center">Unlimited</td>
                  <td className="p-4 text-center">Unlimited</td>
                  <td className="p-4 text-center">Unlimited</td>
                  <td className="p-4 text-center">Unlimited</td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">4B Analysis</td>
                  <td className="p-4 text-center text-muted-foreground">View only</td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center font-semibold text-success">✓ (lab)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">STACK Training</td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Mobility / Drill Work</td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Tempo & Ball Data</td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center font-semibold text-success">✓ (video)</td>
                  <td className="p-4 text-center font-semibold text-success">✓ (video)</td>
                  <td className="p-4 text-center font-semibold text-success">✓ (video)</td>
                  <td className="p-4 text-center font-semibold text-success">✓ (video)</td>
                  <td className="p-4 text-center font-semibold text-success">✓ (video)</td>
                  <td className="p-4 text-center font-semibold text-success">✓ (machine / radar)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">On-Site Evaluation</td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">S2 Cognition</td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Pocket Radar</td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Full Course Access</td>
                  <td className="p-4 text-center text-muted-foreground">Preview</td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Group Zoom Calls</td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center">Weekly</td>
                  <td className="p-4 text-center">Weekly</td>
                  <td className="p-4 text-center text-muted-foreground">Optional</td>
                  <td className="p-4 text-center text-muted-foreground">Optional</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">1-on-1 Zoom Calls</td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center">Weekly</td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center text-muted-foreground">Custom</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Team Dashboard</td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Players</td>
                  <td className="p-4 text-center">1</td>
                  <td className="p-4 text-center">1</td>
                  <td className="p-4 text-center">1</td>
                  <td className="p-4 text-center">1</td>
                  <td className="p-4 text-center">Unlimited</td>
                  <td className="p-4 text-center">Unlimited</td>
                  <td className="p-4 text-center">1-3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl lg:text-5xl font-bold">Still Have Questions?</h2>
          <p className="text-xl opacity-90">
            Contact us to find the perfect plan for your needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" variant="secondary">
                Contact Us
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
