import { OrderLayout } from "@/components/order/OrderLayout";
import { OrderSummaryCard } from "@/components/order/OrderSummaryCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Zap, Target } from "lucide-react";

export default function OrderStarter() {
  return (
    <OrderLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Start Training Smarter With AI Analysis
          </h1>
          <p className="text-xl text-muted-foreground">
            Get instant swing feedback and personalized drills for $29/month
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">What You Get</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Zap className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>AI Swing Analysis</strong> — Upload videos, get instant 4B metrics + drill recommendations
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Target className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>Personalized Training Plans</strong> — Custom drills based on your swing data
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>Progress Tracking</strong> — See your improvements over time with detailed metrics
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
          <p className="text-sm text-center font-medium">
            "Went from .240 to .340 in one season using Coach Rick's system" — Mike T., College Player
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>How does the AI analysis work?</AccordionTrigger>
              <AccordionContent>
                Upload a video of your swing from any angle. Our AI analyzes your mechanics and generates personalized 4B metrics (Bat Speed, Time to Contact, Attack Angle, On-Plane %) plus drill recommendations.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
              <AccordionContent>
                Yes. Cancel anytime from your account dashboard. No long-term contracts or commitments.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>What equipment do I need?</AccordionTrigger>
              <AccordionContent>
                Just a smartphone or camera to record your swings. Any angle works — side view is ideal.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Is this for any skill level?</AccordionTrigger>
              <AccordionContent>
                Yes. Whether you're a youth player or college athlete, the AI adapts to your level and provides relevant feedback.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="flex items-center justify-center gap-8 py-6">
          <Shield className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Secure Payments</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">Cancel Anytime</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">30-Day Guarantee</span>
        </div>
      </div>

      <OrderSummaryCard
        planName="Starter Plan"
        price="$29/mo"
        planCode="starter"
        bullets={[
          "Unlimited swing uploads & AI analysis",
          "4B metrics (Bat Speed, Time to Contact, Attack Angle, On-Plane %)",
          "Personalized drill recommendations",
          "Progress tracking dashboard",
          "Email support",
        ]}
      />
    </OrderLayout>
  );
}
