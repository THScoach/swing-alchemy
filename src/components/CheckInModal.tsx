import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CheckInModalProps {
  open: boolean;
  onClose: () => void;
  playerId: string;
  onSuccess?: () => void;
}

export function CheckInModal({ open, onClose, playerId, onSuccess }: CheckInModalProps) {
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState({
    wins: "",
    challenges: "",
    focus: "",
    support: ""
  });
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      const { error } = await supabase
        .from('weekly_checkins')
        .upsert({
          player_id: playerId,
          week_start: weekStart.toISOString().split('T')[0],
          responses: responses
        });

      if (error) throw error;

      toast({
        title: "Check-In Submitted",
        description: "Your weekly check-in has been recorded.",
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error submitting check-in:', error);
      toast({
        title: "Submission Failed",
        description: "Could not submit check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Weekly Check-In</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>What were your biggest wins this week?</Label>
            <Textarea
              value={responses.wins}
              onChange={(e) => setResponses({ ...responses, wins: e.target.value })}
              placeholder="Share your accomplishments..."
              className="mt-2"
            />
          </div>
          
          <div>
            <Label>What challenges did you face?</Label>
            <Textarea
              value={responses.challenges}
              onChange={(e) => setResponses({ ...responses, challenges: e.target.value })}
              placeholder="What obstacles did you encounter..."
              className="mt-2"
            />
          </div>
          
          <div>
            <Label>What will you focus on next week?</Label>
            <Textarea
              value={responses.focus}
              onChange={(e) => setResponses({ ...responses, focus: e.target.value })}
              placeholder="Your goals for the upcoming week..."
              className="mt-2"
            />
          </div>
          
          <div>
            <Label>What support do you need from the team?</Label>
            <Textarea
              value={responses.support}
              onChange={(e) => setResponses({ ...responses, support: e.target.value })}
              placeholder="How can we help you succeed..."
              className="mt-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Check-In"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
