import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

interface ProgressEmailSettingsProps {
  playerId: string;
  playerEmail?: string;
}

export function ProgressEmailSettings({ playerId, playerEmail }: ProgressEmailSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [email, setEmail] = useState(playerEmail || '');
  const [frequency, setFrequency] = useState<'off' | 'instant' | 'weekly'>('off');

  useEffect(() => {
    loadSubscription();
  }, [playerId]);

  const loadSubscription = async () => {
    const { data } = await supabase
      .from('progress_email_subscriptions')
      .select('*')
      .eq('player_id', playerId)
      .maybeSingle();

    if (data) {
      setSubscription(data);
      setEmail(data.email);
      setFrequency(data.frequency as 'off' | 'instant' | 'weekly');
    }
  };

  const handleSave = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address for progress updates.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (subscription) {
        // Update existing subscription
        const { error } = await supabase
          .from('progress_email_subscriptions')
          .update({ email, frequency, updated_at: new Date().toISOString() })
          .eq('id', subscription.id);

        if (error) throw error;
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('progress_email_subscriptions')
          .insert({ player_id: playerId, email, frequency });

        if (error) throw error;
      }

      toast({
        title: "Settings Saved",
        description: "Progress email settings updated successfully.",
      });

      loadSubscription();
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save email settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle>Progress Email Updates</CardTitle>
        </div>
        <CardDescription>
          Get notified when new 4B analyses are complete
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="player@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Off - No emails</SelectItem>
              <SelectItem value="instant">Instant - After each analysis</SelectItem>
              <SelectItem value="weekly">Weekly - Summary digest</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {frequency === 'off' && "No progress emails will be sent"}
            {frequency === 'instant' && "Receive an email immediately after each new analysis"}
            {frequency === 'weekly' && "Receive a weekly summary of all analyses"}
          </p>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Email Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
