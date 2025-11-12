import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderSummaryCardProps {
  planName: string;
  price: string;
  bullets: string[];
  planCode: "starter" | "hybrid" | "winter" | "team10";
  isOneTime?: boolean;
}

export const OrderSummaryCard = ({
  planName,
  price,
  bullets,
  planCode,
  isOneTime = false,
}: OrderSummaryCardProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Please agree to terms",
        description: "You must agree to the Terms & Privacy Policy to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
        plan_code: planCode,
        user_id: user?.id,
        success_url: `${window.location.origin}/thank-you?plan=${planCode}`,
        cancel_url: `${window.location.origin}/order/${planCode.replace('team10', 'team')}`,
        coupon_code: couponCode || undefined,
      };

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: payload,
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: error.message || "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="lg:sticky lg:top-8 border-2 border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-2xl">{planName}</CardTitle>
        <div className="text-3xl font-bold text-primary mt-2">{price}</div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-3">
          {bullets.map((bullet, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{bullet}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="coupon">Coupon Code (optional)</Label>
          <Input
            id="coupon"
            placeholder="Enter code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
          />
          <Label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer">
            I agree to the Terms of Service and Privacy Policy
          </Label>
        </div>

        <Button
          size="lg"
          className="w-full text-lg"
          onClick={handleCheckout}
          disabled={loading || !agreedToTerms}
        >
          {loading ? "Processing..." : "Continue to Secure Checkout"}
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          🔒 Secure checkout powered by Stripe
        </div>
      </CardContent>
    </Card>
  );
};
