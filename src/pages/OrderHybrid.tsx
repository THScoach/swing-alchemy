import { OrderLayout } from "@/components/order/OrderLayout";
import { OrderSummaryCard } from "@/components/order/OrderSummaryCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Zap, Users, Video } from "lucide-react";

export default function OrderHybrid() {
  return (
    <OrderLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Remote AI + Live Coaching Sessions
          </h1>
          <p className="text-xl text-muted-foreground">
            Get the best of both worlds: instant AI feedback plus scheduled live coaching
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">What You Get</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Zap className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>Everything in Starter</strong> — Unlimited AI analysis, 4B metrics, progress tracking
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Video className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>Live Coaching Sessions</strong> — Scheduled 1-on-1 video calls with Coach Rick
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Users className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>Custom Game Plans</strong> — Personalized training roadmap based on your goals
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>Priority Support</strong> — Direct access to coaching team via email & SMS
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
          <p className="text-sm text-center font-medium">
            "The live sessions made all the difference. I finally understood what the data meant." — Sarah K., High School Varsity
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>How often are live sessions?</AccordionTrigger>
              <AccordionContent>
                You get 2 live coaching sessions per month (30 minutes each). Book them at your convenience through the dashboard.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What if I miss a session?</AccordionTrigger>
              <AccordionContent>
                Sessions can be rescheduled up to 24 hours in advance. Unused sessions do not roll over to the next month.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I upgrade from Starter?</AccordionTrigger>
              <AccordionContent>
                Yes. Upgrade anytime from your account dashboard. You'll be prorated for the remaining time on your Starter plan.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Is there a contract?</AccordionTrigger>
              <AccordionContent>
                No. Cancel anytime. If you cancel, you'll keep access through the end of your billing period.
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
        planName="Hybrid Plan"
        price="$99/mo"
        planCode="hybrid"
        bullets={[
          "Everything in Starter Plan",
          "2 live coaching sessions per month (30 min each)",
          "Custom game plan & training roadmap",
          "Priority email & SMS support",
          "Session recordings for review",
          "Advanced analytics & comparisons",
        ]}
      />
    </OrderLayout>
  );
}
