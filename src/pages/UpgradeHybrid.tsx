import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Bot, Target, Brain } from "lucide-react";

export default function UpgradeHybrid() {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to upgrade");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { 
          planType: "hybrid",
          isUpgrade: true
        },
      });

      if (error) throw error;

      // Handle direct upgrade success
      if (data?.success) {
        toast.success("Successfully upgraded to Hybrid Coaching!");
        setTimeout(() => navigate("/hybrid-welcome"), 2000);
      } else if (data?.url) {
        // Handle checkout session redirect
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      console.error("Upgrade error:", error);
      toast.error(error.message || "Failed to process upgrade");
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Level Up to Hybrid Coaching
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Work directly with Coach Rick — live feedback, real accountability, faster progress.
          </p>
        </div>

        {/* Opening Paragraph */}
        <Card className="mb-8 border-primary/20">
          <CardContent className="p-8">
            <p className="text-lg mb-6 text-foreground">
              You've already got AI feedback working for you.<br />
              Now it's time to accelerate your results with <strong>Hybrid Coaching</strong> — the blend of smart AI and human insight that takes your swing to the next level.
            </p>
            
            <p className="text-lg font-semibold mb-4 text-foreground">
              Here's what you unlock when you upgrade:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-foreground"><strong>Live Weekly Group Calls</strong> with Coach Rick (Q&A + video reviews)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-foreground"><strong>Personal Swing Reviews</strong> — monthly 1-on-1 feedback</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-foreground"><strong>Priority Analysis Queue</strong> (get faster turnaround)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-foreground"><strong>Hybrid Progress Dashboard</strong> tracking real & AI sessions together</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-foreground"><strong>Community Access</strong> — interact with other hitters on the same path</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Block */}
        <Card className="mb-8 border-primary">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Hybrid Coaching Plan</h2>
            <div className="text-5xl font-bold mb-2 text-primary">$99</div>
            <div className="text-muted-foreground mb-6">/month</div>
            <p className="text-foreground mb-6">
              Cancel anytime<br />
              Includes full AI-Adaptive features + live support
            </p>
            <Button 
              size="lg" 
              className="w-full max-w-md text-lg py-6"
              onClick={handleUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? "Processing..." : "Upgrade to Hybrid Coaching →"}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Your card on file will be billed $99/month. You can cancel anytime from your dashboard.
            </p>
          </CardContent>
        </Card>

        {/* Why It Works */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-foreground">
              AI + Human Coaching = Real Results
            </h2>
            <p className="text-lg text-center mb-8 text-foreground">
              AI sees your data.<br />
              Coach Rick sees your patterns.<br />
              Together, they form a feedback loop that adjusts your drills and approach in real-time.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <Bot className="h-16 w-16 mb-4 text-primary" />
                <h3 className="font-semibold text-foreground">AI Feedback</h3>
              </div>
              <div className="flex flex-col items-center">
                <Target className="h-16 w-16 mb-4 text-primary" />
                <h3 className="font-semibold text-foreground">Swing Adjustments</h3>
              </div>
              <div className="flex flex-col items-center">
                <Brain className="h-16 w-16 mb-4 text-primary" />
                <h3 className="font-semibold text-foreground">Human Coaching Insight</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonial */}
        <Card className="mb-8 bg-primary/10 border-primary/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-center text-foreground">
              "Best Coaching Combo I've Ever Had."
            </h2>
            <blockquote className="text-lg italic text-center text-foreground">
              "The weekly calls made the difference. I finally understood what my body needed to do. The AI drills kept me consistent between sessions."
            </blockquote>
            <p className="text-center mt-4 text-muted-foreground">— Current Hybrid Member</p>
          </CardContent>
        </Card>

        {/* Guarantee */}
        <Card className="border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Smarter Every Swing, Guaranteed.
            </h2>
            <p className="text-lg text-foreground">
              Every swing you take adds data that improves your feedback — and we stand behind that.<br />
              If you don't feel improvement after 30 days of consistent uploads, cancel anytime — no questions asked.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
