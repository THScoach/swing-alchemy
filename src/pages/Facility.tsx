import { MarketingLayout } from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Clock, MapPin, Users, Video, Target, BarChart3 } from "lucide-react";

export default function Facility() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">Training Facility</h1>
          <p className="text-xl text-secondary-foreground/90 max-w-3xl mx-auto">
            State-of-the-art equipment and professional instruction in our in-house facility
          </p>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <MapPin className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg text-muted-foreground">
                  [Facility Address]<br />
                  [City, State ZIP]
                </p>
                <p className="text-muted-foreground">
                  Conveniently located with ample parking and easy highway access.
                </p>
                <Button variant="outline">Get Directions</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Monday - Friday:</span>
                  <span className="font-semibold">[Hours TBD]</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Saturday:</span>
                  <span className="font-semibold">[Hours TBD]</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Sunday:</span>
                  <span className="font-semibold">[Hours TBD]</span>
                </div>
                <p className="text-sm text-muted-foreground pt-4">
                  Hours may vary during holidays and special events. Call ahead to confirm.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-12 text-center">Services Offered</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Private Lessons</CardTitle>
                <CardDescription className="text-base">
                  1-on-1 hitting instruction with Rick
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 60-minute personalized sessions</li>
                  <li>• Video analysis included</li>
                  <li>• Customized training plans</li>
                  <li>• Progress tracking</li>
                  <li>• All skill levels welcome</li>
                </ul>
                <div className="pt-4">
                  <p className="text-lg font-semibold">Pricing: [TBD]</p>
                  <Link to="/contact">
                    <Button className="w-full mt-4">Book a Session</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Team Training</CardTitle>
                <CardDescription className="text-base">
                  Group sessions for teams
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 90-minute team sessions</li>
                  <li>• Up to 12 players per session</li>
                  <li>• Video analysis for all players</li>
                  <li>• Team drills and competition</li>
                  <li>• Coach collaboration</li>
                </ul>
                <div className="pt-4">
                  <p className="text-lg font-semibold">Pricing: [TBD]</p>
                  <Link to="/contact">
                    <Button className="w-full mt-4">Request Team Session</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Camps & Clinics</CardTitle>
                <CardDescription className="text-base">
                  Seasonal intensive programs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Multi-day intensive training</li>
                  <li>• Ages 8-18</li>
                  <li>• Small group instruction</li>
                  <li>• Competition & games</li>
                  <li>• Limited spots available</li>
                </ul>
                <div className="pt-4">
                  <p className="text-lg font-semibold">Pricing: [TBD]</p>
                  <Link to="/contact">
                    <Button className="w-full mt-4">View Schedule</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-12 text-center">Facility Equipment</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Video className="h-8 w-8 text-primary mb-2" />
                <CardTitle>HitTrax</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Advanced ball flight tracking system providing real-time data on exit velocity, launch angle, and distance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Video className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Rapsodo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Pitch tracking technology measuring spin rate, velocity, break, and location for comprehensive pitcher analysis.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Pocket Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Professional-grade radar gun for accurate exit velocity and pitch speed measurements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Video className="h-8 w-8 text-primary mb-2" />
                <CardTitle>High-Speed Cameras</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  240fps+ cameras for detailed swing analysis and kinetic sequence breakdown.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>3D Biomechanics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Advanced motion capture technology for comprehensive biomechanical analysis and movement optimization.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Indoor Cages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Four professional-grade batting cages with pitching machines and tee stations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl lg:text-5xl font-bold">Ready to Train?</h2>
          <p className="text-xl opacity-90">
            Schedule your first session and experience the difference professional equipment makes
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary">
              Schedule a Visit
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
