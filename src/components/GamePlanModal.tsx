import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGamePlan } from "@/hooks/useGamePlan";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, User, Activity, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GamePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string;
}

export function GamePlanModal({ open, onOpenChange, playerId }: GamePlanModalProps) {
  const [opponent, setOpponent] = useState("");
  const [pitcher, setPitcher] = useState("");
  const [velocityBand, setVelocityBand] = useState("");
  const [notes, setNotes] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  
  const { generateGamePlan, loading } = useGamePlan();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!opponent || !pitcher) {
      toast({
        title: "Missing Information",
        description: "Please provide opponent and pitcher information",
        variant: "destructive",
      });
      return;
    }

    const plan = await generateGamePlan({
      playerId,
      opponent,
      pitcher,
      velocityBand,
      notes
    });

    if (plan) {
      setGeneratedPlan(plan);
      toast({
        title: "Game-Plan Generated!",
        description: "Your personalized routine is ready",
      });
    }
  };

  const handleClose = () => {
    setOpponent("");
    setPitcher("");
    setVelocityBand("");
    setNotes("");
    setGeneratedPlan(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Game-Plan</DialogTitle>
          <DialogDescription>
            Create a personalized pre-game routine based on opponent and pitcher analysis
          </DialogDescription>
        </DialogHeader>

        {!generatedPlan ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="opponent">Opponent Team</Label>
              <Input
                id="opponent"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                placeholder="e.g., Westside Warriors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pitcher">Pitcher Name</Label>
              <Input
                id="pitcher"
                value={pitcher}
                onChange={(e) => setPitcher(e.target.value)}
                placeholder="e.g., John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="velocity">Velocity Band</Label>
              <Input
                id="velocity"
                value={velocityBand}
                onChange={(e) => setVelocityBand(e.target.value)}
                placeholder="e.g., 85-90 mph"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific observations or requirements..."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Game-Plan"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">{generatedPlan.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Brain className="h-4 w-4 text-primary" />
                      Brain Focus
                    </div>
                    <p className="text-sm text-muted-foreground">{generatedPlan.brainFocus}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4 text-primary" />
                      Body Prep
                    </div>
                    <p className="text-sm text-muted-foreground">{generatedPlan.bodyPrep}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Activity className="h-4 w-4 text-primary" />
                      Bat Approach
                    </div>
                    <p className="text-sm text-muted-foreground">{generatedPlan.batApproach}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Target className="h-4 w-4 text-primary" />
                      Ball Targets
                    </div>
                    <p className="text-sm text-muted-foreground">{generatedPlan.ballTargets}</p>
                  </div>
                </div>

                {generatedPlan.drills && generatedPlan.drills.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="font-medium text-sm">Recommended Drills</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {generatedPlan.drills.map((drill: string, idx: number) => (
                        <li key={idx}>{drill}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedPlan.mentalCues && generatedPlan.mentalCues.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="font-medium text-sm">Mental Cues</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {generatedPlan.mentalCues.map((cue: string, idx: number) => (
                        <li key={idx}>{cue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Close
              </Button>
              <Button onClick={() => setGeneratedPlan(null)} variant="secondary" className="flex-1">
                Generate Another
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
