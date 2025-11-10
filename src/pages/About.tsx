import { MarketingLayout } from "@/components/MarketingLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, Target, TrendingUp } from "lucide-react";

export default function About() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">About The Hitting Skool</h1>
          <p className="text-xl text-secondary-foreground/90 max-w-3xl mx-auto">
            Revolutionizing baseball swing analysis through the science-backed 4B Framework
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
            <p>
              The Hitting Skool was founded on a simple belief: every player deserves access to elite-level swing analysis, regardless of their location or budget. For too long, advanced biomechanical analysis has been reserved for professional organizations and those with expensive equipment.
            </p>
            <p>
              Using cutting-edge AI technology and the comprehensive 4B Framework, we've democratized swing analysis. Our platform provides insights that were previously only available through motion capture labs costing thousands of dollars per session.
            </p>
            <p>
              What started as a passion project has grown into a movement. Today, we serve hundreds of players and coaches across the country, from Little League to college baseball, all working to unlock their full potential at the plate.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="aspect-square bg-muted rounded-2xl shadow-xl flex items-center justify-center">
                <Users className="h-32 w-32 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">Meet Rick, Our Founder</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Rick brings over 15 years of experience in baseball instruction, combining traditional coaching wisdom with modern technology and sports science.
                </p>
                <p>
                  As a former college player and certified hitting instructor, Rick has worked with players at every level, from youth to professional. His coaching philosophy centers on the 4B Framework: understanding that elite hitting requires mastery of Brain (cognitive processing), Body (biomechanics), Bat (swing mechanics), and Ball (contact quality).
                </p>
                <p>
                  Rick's innovative approach integrates S2 Cognition assessments, high-speed video analysis, and data-driven training methodologies to create personalized development plans for each athlete.
                </p>
                <div className="pt-4">
                  <h3 className="font-semibold text-foreground mb-2">Credentials:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>15+ years coaching experience</li>
                    <li>Former college baseball player</li>
                    <li>Certified hitting instructor</li>
                    <li>S2 Cognition certified evaluator</li>
                    <li>Biomechanics specialist</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4B Framework Detailed */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-12 text-center">The 4B Framework Explained</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-success" />
                </div>
                <CardTitle className="text-2xl">🧠 BRAIN</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The cognitive foundation of hitting. Through S2 Cognition integration, we measure:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>Visual Processing:</strong> How quickly you identify pitch type and location</li>
                  <li><strong>Perception Speed:</strong> Rate of visual information processing</li>
                  <li><strong>Trajectory Estimation:</strong> Ability to predict ball path</li>
                  <li><strong>Action Control:</strong> Decision-making and impulse control</li>
                  <li><strong>Timing Control:</strong> Temporal processing for pitch recognition</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  These cognitive skills separate good hitters from great ones. Our system helps you understand and improve your mental game.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">💪 BODY</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The biomechanical engine that generates power. We analyze:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>Kinetic Sequence:</strong> Proper timing of pelvis → torso → arms → bat</li>
                  <li><strong>Tempo Ratio:</strong> Optimal relationship between body segment timings</li>
                  <li><strong>Hip-Shoulder Separation:</strong> Creating torque through counter-rotation</li>
                  <li><strong>Weight Transfer:</strong> Efficient energy transfer from back to front</li>
                  <li><strong>Balance:</strong> Maintaining athletic posture throughout the swing</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Using 240fps video and AI pose detection, we identify exactly where your kinetic chain breaks down.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-warning" />
                </div>
                <CardTitle className="text-2xl">🏏 BAT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The tool that makes contact. Critical metrics include:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>Bat Speed:</strong> Peak velocity at contact zone (target: 70+ mph)</li>
                  <li><strong>Attack Angle:</strong> Bat path relative to pitch plane (target: 15-20°)</li>
                  <li><strong>Time to Contact:</strong> Efficiency from launch to contact (target: 0.13-0.15s)</li>
                  <li><strong>Bat Path Efficiency:</strong> Directness to contact point (target: 90%+)</li>
                  <li><strong>Barrel Control:</strong> Consistency of sweet spot contact</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  These metrics determine how effectively you deliver the barrel to the ball.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl">⚾ BALL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The outcome that matters. We track:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>Exit Velocity:</strong> Ball speed off the bat via Pocket Radar (target: 95+ mph)</li>
                  <li><strong>Launch Angle:</strong> Vertical angle of batted ball (target: 15-25°)</li>
                  <li><strong>Estimated Distance:</strong> Projected carry distance (target: 300+ ft)</li>
                  <li><strong>Contact Quality:</strong> Composite score of contact metrics</li>
                  <li><strong>Consistency:</strong> Standard deviation across attempts</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  The ultimate measure of swing effectiveness - turning your mechanics into results.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-12 text-center">Our Mission & Values</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Mission</h3>
              <p className="text-muted-foreground text-lg">
                To empower every baseball and softball player with professional-grade swing analysis, making elite-level coaching accessible to athletes everywhere.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4">Core Values</h3>
              <ul className="space-y-4">
                <li>
                  <strong className="text-lg">Data-Driven Development:</strong>
                  <p className="text-muted-foreground mt-1">
                    We believe in objective measurement and continuous improvement backed by science.
                  </p>
                </li>
                <li>
                  <strong className="text-lg">Accessibility:</strong>
                  <p className="text-muted-foreground mt-1">
                    Advanced coaching tools shouldn't be limited to those with unlimited budgets or professional facilities.
                  </p>
                </li>
                <li>
                  <strong className="text-lg">Holistic Development:</strong>
                  <p className="text-muted-foreground mt-1">
                    True hitting excellence requires developing the Brain, Body, Bat, and Ball - not just swing mechanics.
                  </p>
                </li>
                <li>
                  <strong className="text-lg">Innovation:</strong>
                  <p className="text-muted-foreground mt-1">
                    We constantly push boundaries, integrating the latest technology and research into our platform.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
