import { MarketingLayout } from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Try before you buy",
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
    name: "Self-Service",
    price: "$29",
    period: "/mo",
    description: "DIY analysis and training",
    features: [
      { text: "Unlimited video uploads", included: true },
      { text: "Full 4B analysis", included: true },
      { text: "S2 Cognition upload", included: true },
      { text: "Pocket Radar integration", included: true },
      { text: "Full course access", included: true },
      { text: "Feed content", included: true },
      { text: "Group Zoom calls", included: false },
      { text: "1-on-1 Zoom calls", included: false },
      { text: "Team dashboard", included: false },
    ],
    cta: "Select Plan",
    highlighted: false,
  },
  {
    name: "Group Coaching",
    price: "$99",
    period: "/mo",
    description: "Weekly group sessions",
    features: [
      { text: "Everything in Self-Service", included: true },
      { text: "Weekly group Zoom calls", included: true },
      { text: "Group chat & forum", included: true },
      { text: "Priority support", included: true },
      { text: "1-on-1 Zoom calls", included: false },
      { text: "Team dashboard", included: false },
    ],
    cta: "Select Plan",
    highlighted: false,
  },
  {
    name: "1-on-1 Coaching",
    price: "$299",
    period: "/mo",
    description: "Private sessions with Rick",
    features: [
      { text: "Everything in Group Coaching", included: true },
      { text: "Weekly private Zoom calls", included: true },
      { text: "Direct messaging with Rick", included: true },
      { text: "Personalized training plans", included: true },
      { text: "Priority support", included: true },
      { text: "Team dashboard", included: false },
    ],
    cta: "Select Plan",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$499",
    period: "/mo",
    description: "For coaches & teams",
    features: [
      { text: "Everything in Self-Service", included: true },
      { text: "Unlimited players", included: true },
      { text: "Coach dashboard", included: true },
      { text: "Team analytics", included: true },
      { text: "Bulk video uploads", included: true },
      { text: "Leaderboards", included: true },
      { text: "Add Group Coaching (+$200/mo)", included: true },
    ],
    cta: "Select Plan",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
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

export default function PricingPage() {
  return (
    <MarketingLayout>
      {/* Header */}
      <section className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">Choose Your Plan</h1>
          <p className="text-xl text-secondary-foreground/90 max-w-2xl mx-auto">
            Select the coaching tier that fits your goals and budget
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <Link to="/auth" className="w-full">
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
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">4B Analysis</td>
                  <td className="p-4 text-center text-muted-foreground">View only</td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
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
