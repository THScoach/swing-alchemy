import { OrderLayout } from "@/components/order/OrderLayout";
import { OrderSummaryCard } from "@/components/order/OrderSummaryCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Calendar, Users, Trophy } from "lucide-react";

export default function OrderWinter() {
  return (
    <OrderLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Elite Winter Training Program
          </h1>
          <p className="text-xl text-muted-foreground">
            12-week intensive program to dominate next season. One-time payment.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">What You Get</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Calendar className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>12-Week Structured Program</strong> — Week-by-week training plan with clear milestones
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Users className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>Weekly Live Group Coaching</strong> — Join other elite players for Q&A and technique work
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Trophy className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>Personalized Performance Goals</strong> — Custom targets based on your position and level
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>Full Platform Access Until March 31</strong> — Unlimited uploads, AI analysis, and progress tracking
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
          <p className="text-sm text-center font-medium">
            "I added 6 mph bat speed in 10 weeks. Best investment I've made in my game." — Jake M., D1 Commit
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>When does the program start?</AccordionTrigger>
              <AccordionContent>
                The next cohort starts on the first Monday after you enroll. You'll receive your full schedule and onboarding materials within 24 hours.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What happens after March 31?</AccordionTrigger>
              <AccordionContent>
                Your access to the Winter Program ends on March 31. You can upgrade to the Hybrid Plan ($99/mo) to keep year-round access and continue live coaching.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is there a refund policy?</AccordionTrigger>
              <AccordionContent>
                Yes. If you complete Week 1 and don't see measurable improvement in your metrics, we'll refund 100% — no questions asked.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>What equipment do I need?</AccordionTrigger>
              <AccordionContent>
                Access to a batting cage or hitting facility, a smartphone for recording swings, and basic training equipment (bat, balls, tee). We provide equipment recommendations in your onboarding packet.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Can I get one-on-one coaching?</AccordionTrigger>
              <AccordionContent>
                Group sessions are included. Private 1-on-1 sessions can be added for $150/session (limited availability).
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="flex items-center justify-center gap-8 py-6">
          <Shield className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Secure Payments</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">100% Refund Guarantee</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">Limited Spots</span>
        </div>
      </div>

      <OrderSummaryCard
        planName="Winter Program"
        price="$997"
        planCode="winter"
        isOneTime
        bullets={[
          "12-week structured training program",
          "Weekly live group coaching sessions",
          "Personalized performance targets",
          "Full platform access until March 31",
          "Private community access",
          "Equipment & drill recommendations",
          "100% refund guarantee after Week 1",
        ]}
      />
    </OrderLayout>
  );
}
