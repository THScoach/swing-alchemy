import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Feed() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Feed</h1>
        </div>

        {/* Upload CTA Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Start Analyzing Your Swing</CardTitle>
            <CardDescription>
              Upload a video to get instant feedback on your hitting mechanics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/analyze")} 
              className="w-full"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Upload New Video
            </Button>
          </CardContent>
        </Card>

        {/* Latest Analysis Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Latest Analysis</CardTitle>
            <CardDescription>Session from 2 days ago</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Brain Score</p>
                <div className="flex items-center gap-2">
                  <Progress value={82} className="flex-1" />
                  <span className="text-sm font-semibold">82</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Body Score</p>
                <div className="flex items-center gap-2">
                  <Progress value={75} className="flex-1" />
                  <span className="text-sm font-semibold">75</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Bat Score</p>
                <div className="flex items-center gap-2">
                  <Progress value={88} className="flex-1" />
                  <span className="text-sm font-semibold">88</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Ball Score</p>
                <div className="flex items-center gap-2">
                  <Progress value={91} className="flex-1" />
                  <span className="text-sm font-semibold">91</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              View Full Analysis
            </Button>
          </CardContent>
        </Card>

        {/* Training Content Feed */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Training Content</h2>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1">Improving Bat Speed</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Learn the key mechanics to increase your bat speed and generate more power at the plate
                  </p>
                  <p className="text-xs text-primary mt-1">5 min watch</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1">Hip Rotation Drill</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Master the proper hip rotation sequence for maximum power transfer
                  </p>
                  <p className="text-xs text-primary mt-1">8 min watch</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1">Launch Angle Optimization</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Find your optimal launch angle for consistent hard contact
                  </p>
                  <p className="text-xs text-primary mt-1">6 min watch</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
