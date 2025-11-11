import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Video, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

interface PlanConfig {
  name: string;
  price: string;
  priceAmount: number;
  period?: string;
  headline: string;
  subheadline: string;
  videoUrl?: string;
  benefits: string[];
  cta: string;
  planType: string;
}

const planConfigs: Record<string, PlanConfig> = {
  "winter-program": {
    name: "Winter Program",
    price: "$997",
    priceAmount: 997,
    period: " one-time",
    headline: "The Complete Winter Training System for Hitters.",
    subheadline: "A full off-season program combining AI swing analysis, personalized feedback, and live coaching with Coach Rick.",
    benefits: [
      "Comprehensive 4B + Tempo evaluation",
      "Weekly assignments and private video feedback",
      "Exclusive Winter access — graduates continue at $99/mo if desired",
    ],
    cta: "Complete My Enrollment",
    planType: "winter-program",
  },
  "self-service": {
    name: "Self-Service",
    price: "$29",
    priceAmount: 29,
    period: "/mo",
    headline: "Train Smarter. Every Swing, Analyzed by AI.",
    subheadline: "Get instant feedback, weekly swing reports, and community access — anywhere in the world.",
    benefits: [
      "Unlimited swing uploads with THS AI feedback",
      "Access to Swing Rehab OS courses & drills",
      "Private community for questions, progress, and wins",
    ],
    cta: "Start Training Today",
    planType: "self-service",
  },
  "group-coaching": {
    name: "Group Coaching",
    price: "$99",
    priceAmount: 99,
    period: "/mo",
    headline: "Join the Team. Weekly Coaching & Accountability.",
    subheadline: "Work directly with Coach Rick and a community of driven players chasing the same goal.",
    benefits: [
      "Weekly live Zoom training sessions",
      "Personalized drill feedback and group Q&A",
      "Priority video analysis inside the app",
    ],
    cta: "Join the Group",
    planType: "group-coaching",
  },
};

const orderFormSchema = z.object({
  playerName: z.string().min(2, "Player name must be at least 2 characters"),
  parentName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  height: z.string().optional(),
  weight: z.string().optional(),
  age: z.string().optional(),
  bats: z.enum(["R", "L", "S", ""]).optional(),
  throws: z.enum(["R", "L", ""]).optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

export default function Order() {
  const { plan } = useParams<{ plan: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    playerName: "",
    parentName: "",
    email: "",
    phone: "",
    height: "",
    weight: "",
    age: "",
    bats: "",
    throws: "",
    level: "",
    agreeToTerms: false,
  });

  if (!plan || !planConfigs[plan]) {
    navigate("/pricing");
    return null;
  }

  const config = planConfigs[plan];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      const validated = orderFormSchema.parse(formData);

      console.log("Creating checkout session with data:", {
        planType: config.planType,
        amount: config.priceAmount,
        playerName: validated.playerName,
        email: validated.email,
      });

      // Create Stripe checkout session with player metadata
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          planType: config.planType,
          sessionType: config.planType,
          amount: config.priceAmount,
          customerName: validated.playerName,
          customerEmail: validated.email,
          customerPhone: validated.phone,
          metadata: {
            parentName: validated.parentName || "",
            height: validated.height || "",
            weight: validated.weight || "",
            age: validated.age || "",
            bats: validated.bats || "",
            throws: validated.throws || "",
            level: formData.level || "",
            createAccount: "true", // Flag to auto-create account
          },
        },
      });

      if (error) {
        console.error("Checkout error:", error);
        throw error;
      }

      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Order submission error:", error);
      
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(firstError.message);
      } else {
        toast.error(error.message || "Failed to process order");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Trust Bar */}
      <div className="bg-success/10 border-b border-success/20 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              <span>Safe Checkout via Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              <span>Secure Data Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              <span>Limited Winter Enrollment</span>
            </div>
          </div>
        </div>
      </div>

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

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 pb-12">
        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
          Join The Hitting Skool Winter Program
        </h1>
        <p className="text-xl text-muted-foreground">
          Limited Spots for 2025 Training
        </p>
        <p className="text-lg">
          Transform your swing this offseason with Coach Rick's proven 4B System and Reboot-validated biomechanics.
        </p>
      </div>

      {/* Video Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
        <div className="mt-6 text-center">
          <Button size="lg" onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Reserve My Spot in The Winter Program
          </Button>
        </div>
      </div>

      {/* Core Offer Section */}
      <div className="bg-muted/30 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* What You Get */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">What You Get</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                  <span className="text-lg">Personalized biomechanical swing analysis (Tempo + Reboot integration)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                  <span className="text-lg">Weekly feedback and drills from Coach Rick</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                  <span className="text-lg">Access to The Hitting Skool app + community</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                  <span className="text-lg">Private leaderboard + player dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                  <span className="text-lg">End-of-program report card and progress summary</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                  <span className="text-lg">Access to the Pro Swing Library and Benchmarks</span>
                </li>
              </ul>
            </div>

            {/* Order Summary */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-2xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Program:</span>
                    <span className="font-semibold">{config.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-semibold">December 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-semibold">Full winter training cycle</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t">
                    <span className="text-muted-foreground">Includes:</span>
                    <span className="text-sm">Video analysis, AI tracking, weekly reports</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-xl font-bold">Total:</span>
                    <span className="text-3xl font-bold text-primary">{config.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <div id="order-form" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-2 border-primary shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Complete Your Enrollment</CardTitle>
            <p className="text-muted-foreground">Fill out your information below to secure your spot</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Two Column Form */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column: Player Info */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold border-b pb-2">Player Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="playerName">Player Name *</Label>
                    <Input
                      id="playerName"
                      required
                      value={formData.playerName}
                      onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Player Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentName">Parent/Guardian Name</Label>
                    <Input
                      id="parentName"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (in)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="72"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (lbs)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bats">Bats</Label>
                      <select
                        id="bats"
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                        value={formData.bats}
                        onChange={(e) => setFormData({ ...formData, bats: e.target.value })}
                        disabled={loading}
                      >
                        <option value="">-</option>
                        <option value="R">R</option>
                        <option value="L">L</option>
                        <option value="S">S</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="throws">Throws</Label>
                      <select
                        id="throws"
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                        value={formData.throws}
                        onChange={(e) => setFormData({ ...formData, throws: e.target.value })}
                        disabled={loading}
                      >
                        <option value="">-</option>
                        <option value="R">R</option>
                        <option value="L">L</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <select
                      id="level"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      disabled={loading}
                    >
                      <option value="">Select level</option>
                      <option value="Youth">Youth</option>
                      <option value="HS">High School</option>
                      <option value="College">College</option>
                      <option value="Pro">Professional</option>
                    </select>
                  </div>
                </div>

                {/* Right Column: Payment */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold border-b pb-2">Payment Information</h3>
                  
                  <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-lg font-semibold">Program Total:</span>
                      <span className="text-2xl font-bold text-primary">{config.price}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Payment will be securely processed via Stripe. You'll be redirected to complete your card details on the next page.
                    </p>

                    <div className="flex items-start space-x-2 pt-4">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, agreeToTerms: checked as boolean })
                        }
                        disabled={loading}
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm leading-relaxed cursor-pointer"
                      >
                        I understand this is a one-time $997 Winter Program enrollment and I agree to The Hitting Skool terms & privacy policy.
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-lg h-14 mt-6"
                    size="lg"
                    disabled={loading || !formData.agreeToTerms}
                  >
                    {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Complete My Enrollment →
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Guarantee Section */}
      <div className="bg-muted/50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl">🔒</div>
              <h3 className="text-xl font-bold">100% Secure Checkout</h3>
              <p className="text-muted-foreground">
                Your payment and personal information are safe. We use industry-standard SSL protection.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">🏆</div>
              <h3 className="text-xl font-bold">100% Program Guarantee</h3>
              <p className="text-muted-foreground">
                If you're not satisfied after completing your first 2 weeks, you can request a full refund — no questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-2xl font-bold">Questions Before You Join?</h3>
          <p className="text-muted-foreground">
            📞 Text "Winter" to your coach or email support@thehittingskool.com
          </p>
        </div>
      </div>

      {/* Footer Message */}
      <div className="bg-primary/5 py-12 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground italic">
            Every swing you upload helps THS AI learn your movement and tempo — the more you train, the smarter your analysis becomes.
          </p>
        </div>
      </div>
    </div>
  );
}
