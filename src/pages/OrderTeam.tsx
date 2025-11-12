import { OrderLayout } from "@/components/order/OrderLayout";
import { OrderSummaryCard } from "@/components/order/OrderSummaryCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Users, BarChart, Calendar } from "lucide-react";

export default function OrderTeam() {
  return (
    <OrderLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Team Coach Dashboard — Manage Up to 10 Players
          </h1>
          <p className="text-xl text-muted-foreground">
            Complete coaching platform with team analytics, leaderboards, and automated reports
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">What You Get</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Users className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>Team Dashboard for 10 Players</strong> — Manage all your hitters in one place
              </div>
            </li>
            <li className="flex items-start gap-3">
              <BarChart className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>Weekly Team Reports + Leaderboards</strong> — See who's improving, who needs attention
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Calendar className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>Player Upload Links</strong> — Send custom links so players can upload their own swings
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <strong>Seat-Based Pricing</strong> — Add or remove players as your roster changes
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
          <p className="text-sm text-center font-medium">
            "Saves me 5+ hours a week. My team's batting average went up 40 points in one season." — Coach Davis, High School Varsity
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>How do player uploads work?</AccordionTrigger>
              <AccordionContent>
                Each player gets a unique upload link. They record their swings, upload via the link, and you see their analysis instantly in your dashboard. No manual work required.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What if I have more than 10 players?</AccordionTrigger>
              <AccordionContent>
                You can upgrade to 15 seats ($899/mo) or 25 seats ($1,299/mo) anytime from your dashboard. Seat changes are prorated.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I remove players mid-season?</AccordionTrigger>
              <AccordionContent>
                Yes. You can add or remove players anytime. Billing adjusts at your next cycle. Player data is preserved if you re-add them later.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Do I need to be tech-savvy?</AccordionTrigger>
              <AccordionContent>
                No. The dashboard is designed for coaches, not engineers. Send links, review reports, done. We also provide onboarding and priority support.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Is there a contract?</AccordionTrigger>
              <AccordionContent>
                No. Month-to-month billing. Cancel anytime. Most coaches run it seasonally (Feb–Oct) and pause in the off-season.
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
          <span className="text-sm text-muted-foreground">Priority Support</span>
        </div>
      </div>

      <OrderSummaryCard
        planName="Team Coach Plan"
        price="$699/mo"
        planCode="team10"
        bullets={[
          "Team dashboard for up to 10 players",
          "Weekly team reports + leaderboards",
          "Individual player upload links",
          "Unlimited swing uploads & AI analysis",
          "90-day team trend analytics",
          "Priority support + onboarding call",
          "Add seats as you grow (15 or 25 available)",
        ]}
      />
    </OrderLayout>
  );
}
