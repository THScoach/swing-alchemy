import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MarketingLayout } from "@/components/MarketingLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Check, Users, TrendingUp, Award, Shield, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TEAM_PLANS = [
  {
    id: "3m",
    name: "3-Month Team Pass",
    price: 499,
    duration: "3 months",
    durationDays: 90,
    savingsText: "Best for offseason training",
  },
  {
    id: "4m",
    name: "4-Month Team Pass",
    price: 799,
    duration: "4 months",
    durationDays: 120,
    savingsText: "Most popular choice",
    popular: true,
  },
  {
    id: "6m",
    name: "6-Month Team Pass",
    price: 1099,
    duration: "6 months",
    durationDays: 180,
    savingsText: "Best value per month",
  },
];

const FEATURES = [
  { icon: Users, text: "Up to 10 players per team" },
  { icon: TrendingUp, text: "Individual player progress tracking" },
  { icon: Award, text: "Weekly team performance reports" },
  { icon: Shield, text: "Coach dashboard with full visibility" },
  { icon: Zap, text: "Access to The Hitting Skool community" },
  { icon: Check, text: "Players can upgrade to 1-on-1 anytime" },
];

export default function OrderTeam() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("4m");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Call checkout edge function
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { plan: selectedPlan, orgName: orgName || "My Team" },
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = TEAM_PLANS.find(p => p.id === selectedPlan);

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Train Your Whole Roster
            <br />
            <span className="text-primary">Inside The Hitting Skool</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Give your entire team access to 4B biomechanics, Coach Rick's training system, and community support.
            Track every player's progress from one dashboard.
          </p>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {FEATURES.map((feature, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <feature.icon className="h-8 w-8 text-primary mb-4" />
                  <p className="font-medium">{feature.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Choose Your Team Plan</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {TEAM_PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? "ring-2 ring-primary shadow-lg"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.savingsText}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground ml-2">one-time</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.duration} of team access
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Check className="h-4 w-4" />
                      <span>${(plan.price / plan.durationDays * 30).toFixed(0)}/month per team</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Form */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Complete Your Order</CardTitle>
                <CardDescription>
                  You selected: {selectedPlanData?.name} - ${selectedPlanData?.price}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Team/Organization Name (Optional)</Label>
                  <Input
                    id="orgName"
                    placeholder="e.g., Blue Jays Baseball"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-medium">{selectedPlanData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{selectedPlanData?.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Players:</span>
                    <span className="font-medium">Up to 10</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2 flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${selectedPlanData?.price}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Pay later with Klarna, Affirm, or Afterpay at checkout</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Continue to Checkout →"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How many players can I add?</AccordionTrigger>
                <AccordionContent>
                  Each team plan includes access for up to 10 players. If you need more, contact us at support@4bhitting.com for custom team pricing.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What happens after the access period ends?</AccordionTrigger>
                <AccordionContent>
                  You'll receive a reminder before your access expires. You can renew at any time to keep your team's progress and data. No data is lost during renewal.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can players upgrade to 1-on-1 coaching?</AccordionTrigger>
                <AccordionContent>
                  Yes! Any player can upgrade to individual 1-on-1 coaching at any time. Team access continues alongside individual plans.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept all major credit cards, as well as Buy Now, Pay Later options through Klarna, Affirm, and Afterpay at checkout.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Do I get a coach dashboard?</AccordionTrigger>
                <AccordionContent>
                  Yes! You'll have full access to a coach dashboard where you can view all player progress, track uploads, review metrics, and monitor team performance.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-16 text-center">
          <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Level Up Your Team?</h3>
              <p className="mb-6 opacity-90">
                Join hundreds of coaches who trust 4B Hitting to develop their players.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Get Started Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MarketingLayout>
  );
}
