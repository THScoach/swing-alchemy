import { MarketingLayout } from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Brain, Users, Target, TrendingUp, Video, BarChart3, CheckCircle2, Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Landing() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative bg-brand-black text-foreground py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-7xl font-orbitron font-bold leading-tight">
                Simplify the Science. <span className="text-brand-gold">Train the Sequence.</span>
              </h1>
              <p className="text-xl text-foreground/90 font-montserrat">
                Master the kinetic chain with biomechanics-driven training. The 4B Performance Science system analyzes
                your swing through Ball, Bat, Body, and Brain to unlock elite power and consistency.
              </p>
              <p className="text-lg text-foreground/70 font-montserrat italic">
                Every swing you upload helps The Hitting Skool's AI learn your movement patterns. 
                The smarter it gets, the better your drill recommendations become.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/offer/free-tempo">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 font-montserrat">
                    Start Free Assessment
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 font-montserrat border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="aspect-video rounded-2xl shadow-2xl object-cover w-full border border-brand-gold/20"
              >
                <source src="https://res.cloudinary.com/dzkwltgyd/video/upload/v1762974085/glif-run-outputs/b90klnjjxjnqj88cbrxt.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-orbitron font-bold mb-4">The 4B Framework</h2>
            <p className="text-xl text-muted-foreground font-montserrat">Complete swing analysis across four critical dimensions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-success" />
                </div>
                <CardTitle className="font-rajdhani text-brand-gold">🧠 BRAIN</CardTitle>
                <CardDescription className="text-base font-montserrat">
                  S2 Cognition integration for visual processing & action control
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-rajdhani text-brand-gold">💪 BODY</CardTitle>
                <CardDescription className="text-base font-montserrat">
                  Kinetic sequence analysis with 240fps video requirement
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-warning" />
                </div>
                <CardTitle className="font-rajdhani text-brand-gold">🏏 BAT</CardTitle>
                <CardDescription className="text-base font-montserrat">
                  Swing mechanics, bat speed, attack angle, path efficiency
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="font-rajdhani text-brand-gold">⚾ BALL</CardTitle>
                <CardDescription className="text-base font-montserrat">
                  Pocket Radar integration for exit velocity tracking
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-orbitron font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground font-montserrat">Three simple steps to better hitting</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-primary-foreground font-bold text-xl">
                  1
                </div>
                <CardTitle>Upload Your Swing</CardTitle>
                <CardDescription className="text-base">
                  Record your swing at 240fps using Slo-Mo mode on your phone
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-primary-foreground font-bold text-xl">
                  2
                </div>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription className="text-base">
                  AI motion tracking analyzes your kinetic sequence automatically. Every swing you upload helps it learn your movement patterns better.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-primary-foreground font-bold text-xl">
                  3
                </div>
                <CardTitle>Get Results</CardTitle>
                <CardDescription className="text-base">
                  View 4B dashboards and personalized training recommendations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Coaching Tiers */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Coaching Options</h2>
            <p className="text-xl text-muted-foreground">Choose the level of support that's right for you</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Self-Service</CardTitle>
                <div className="text-3xl font-bold text-primary">$29<span className="text-lg text-muted-foreground">/mo</span></div>
                <CardDescription>DIY analysis and training</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Unlimited video uploads
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Full 4B analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Course library access
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Group Coaching</CardTitle>
                <div className="text-3xl font-bold text-primary">$99<span className="text-lg text-muted-foreground">/mo</span></div>
                <CardDescription>Weekly group sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Everything in Self-Service
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Weekly group Zoom calls
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Group community access
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-primary">
              <CardHeader>
                <CardTitle>1-on-1 Coaching</CardTitle>
                <div className="text-3xl font-bold text-primary">$299<span className="text-lg text-muted-foreground">/mo</span></div>
                <CardDescription>Private sessions with Rick</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Everything in Group
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Weekly private Zoom
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Personalized training plans
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <div className="text-3xl font-bold text-primary">$499<span className="text-lg text-muted-foreground">/mo</span></div>
                <CardDescription>For coaches & teams</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Unlimited players
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Coach dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Team analytics
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link to="/pricing">
              <Button size="lg">View Full Pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* In-House Training */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-5xl font-bold">In-House Training Facility</h2>
              <p className="text-xl text-muted-foreground">
                Visit our state-of-the-art training center equipped with the latest technology
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <strong>Private Lessons:</strong> 1-on-1 hitting instruction with Rick
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <strong>Team Training:</strong> Group sessions for teams of up to 12 players
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <strong>Equipment:</strong> HitTrax, Rapsodo, Pocket Radar, 240fps cameras
                  </div>
                </li>
              </ul>
              <Link to="/facility">
                <Button size="lg">Schedule a Visit</Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-video bg-muted rounded-2xl shadow-xl flex items-center justify-center">
                <BarChart3 className="h-24 w-24 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">What Players & Coaches Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <CardDescription className="text-base italic">
                  "The kinetic sequence analysis helped me identify exactly where my swing was breaking down. Increased my exit velo by 8 mph in 3 months!"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">- Jake M., High School Player</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <CardDescription className="text-base italic">
                  "The team dashboard makes it so easy to track all my players' progress. The 4B Framework gives me clear coaching points for each athlete."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">- Coach Sarah T., Travel Ball</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <CardDescription className="text-base italic">
                  "The S2 Cognition integration was a game-changer. Understanding my visual processing helped me stay back on breaking balls better."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">- Marcus R., College Player</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-background rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">
                What is the 4B Framework?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                The 4B Framework analyzes hitting performance across four critical dimensions: Brain (cognitive processing via S2 Cognition), Body (kinetic sequence and mechanics), Bat (swing metrics and efficiency), and Ball (contact quality and exit velocity). This comprehensive approach ensures complete player development.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-background rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">
                Why is 240fps video required?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                A baseball swing happens in less than 0.2 seconds. To accurately analyze the kinetic sequence and identify the precise timing of each body segment, we need high-speed video at 240 frames per second. This allows our AI to detect subtle movements that regular video would miss.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-background rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">
                How does S2 Cognition integration work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                S2 Cognition provides detailed reports on visual processing and action control. You can upload your S2 report PDF, and our system automatically parses the percentile scores for perception speed, trajectory estimation, timing control, and impulse control. These metrics appear in your BRAIN dashboard alongside your swing analysis.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-background rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">
                Can I use Pocket Radar with the app?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! You can manually enter Pocket Radar readings or sync them automatically (coming soon). Exit velocity data links to your video analyses and appears in your BALL dashboard, helping you track power development over time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-background rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">
                Do you offer team packages?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! Our Team tier ($499/mo) includes unlimited players, a coach dashboard with team analytics, leaderboards, and bulk video upload. Perfect for travel ball teams, high school programs, and hitting instructors managing multiple athletes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold">Ready to Transform Your Swing?</h2>
          <p className="text-xl opacity-90">
            Join hundreds of players and coaches already using The Hitting Skool
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
