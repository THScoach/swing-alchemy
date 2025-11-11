import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionType: string;
}

const sessionPrices: Record<string, number> = {
  "4b-evaluation": 299,
  "pod": 399,
  "hybrid-addon": 99,
  "nine-inning": 997,
  "private-session": 125
};

const sessionNames: Record<string, string> = {
  "4b-evaluation": "4B Elite Evaluation",
  "pod": "4B Training Pod",
  "hybrid-addon": "Hybrid Add-On",
  "nine-inning": "Nine-Inning Intensive",
  "private-session": "Private 1-on-1 Session"
};

export function BookingModal({ open, onOpenChange, sessionType }: BookingModalProps) {
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [addOns, setAddOns] = useState({
    s2Integration: false,
    rebootImport: false,
    hybridUpgrade: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !timeSlot) {
      toast.error("Please select a date and time");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to book a session");
        return;
      }

      // Get player and profile info
      const { data: players } = await supabase
        .from('players')
        .select('id, name, organization_id, contact')
        .eq('profile_id', user.id)
        .limit(1);

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', user.id)
        .single();

      if (!players || players.length === 0) {
        toast.error("Please complete your profile first");
        return;
      }

      const player = players[0];

      // Create datetime from date and timeSlot
      const [hours, minutes] = timeSlot.split(':');
      const scheduledAt = new Date(date);
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Get user email
      const userEmail = user.email || player.contact || "";
      const userPhone = profile?.phone || player.contact || "";
      const userName = profile?.name || player.name || "Player";

      // Create checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke("create-checkout", {
        body: {
          planType: sessionNames[sessionType],
          sessionType: sessionType,
          amount: totalPrice,
          playerName: userName,
          playerEmail: userEmail,
          playerPhone: userPhone,
          playerId: player.id,
          scheduledDate: scheduledAt.toISOString(),
          metadata: {
            addOns: addOns,
            location: "The Hitting Skool Lab - Fenton, MO",
          },
        },
      });

      if (checkoutError) throw checkoutError;

      // Redirect to Stripe checkout
      if (checkoutData?.url) {
        window.open(checkoutData.url, '_blank');
        toast.success("Redirecting to payment...");
        onOpenChange(false);
      } else {
        throw new Error("No checkout URL returned");
      }
      
      // Reset form
      setDate(undefined);
      setTimeSlot("");
      setAddOns({ s2Integration: false, rebootImport: false, hybridUpgrade: false });
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error("Failed to create checkout session");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = sessionPrices[sessionType] + 
    (addOns.s2Integration ? 50 : 0) + 
    (addOns.rebootImport ? 75 : 0) + 
    (addOns.hybridUpgrade ? 99 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Your Session</DialogTitle>
          <DialogDescription>
            {sessionNames[sessionType] || "Training Session"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          {/* Time Slot */}
          <div className="space-y-2">
            <Label htmlFor="time">Select Time</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Choose time slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="09:30">9:30 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="10:30">10:30 AM</SelectItem>
                <SelectItem value="11:00">11:00 AM</SelectItem>
                <SelectItem value="11:30">11:30 AM</SelectItem>
                <SelectItem value="13:00">1:00 PM</SelectItem>
                <SelectItem value="13:30">1:30 PM</SelectItem>
                <SelectItem value="14:00">2:00 PM</SelectItem>
                <SelectItem value="14:30">2:30 PM</SelectItem>
                <SelectItem value="15:00">3:00 PM</SelectItem>
                <SelectItem value="15:30">3:30 PM</SelectItem>
                <SelectItem value="16:00">4:00 PM</SelectItem>
                <SelectItem value="16:30">4:30 PM</SelectItem>
                <SelectItem value="17:00">5:00 PM</SelectItem>
                <SelectItem value="17:30">5:30 PM</SelectItem>
                <SelectItem value="18:00">6:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add-ons */}
          <div className="space-y-4">
            <Label>Add-Ons (Optional)</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="s2" 
                  checked={addOns.s2Integration}
                  onCheckedChange={(checked) => 
                    setAddOns(prev => ({ ...prev, s2Integration: checked as boolean }))
                  }
                />
                <label htmlFor="s2" className="text-sm cursor-pointer">
                  S2 Cognition Integration (+$50)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="reboot" 
                  checked={addOns.rebootImport}
                  onCheckedChange={(checked) => 
                    setAddOns(prev => ({ ...prev, rebootImport: checked as boolean }))
                  }
                />
                <label htmlFor="reboot" className="text-sm cursor-pointer">
                  Reboot Motion Import (+$75)
                </label>
              </div>
              {sessionType === 'pod' && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hybrid" 
                    checked={addOns.hybridUpgrade}
                    onCheckedChange={(checked) => 
                      setAddOns(prev => ({ ...prev, hybridUpgrade: checked as boolean }))
                    }
                  />
                  <label htmlFor="hybrid" className="text-sm cursor-pointer">
                    Hybrid Upgrade - Remote Feedback (+$99/mo)
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Total Price */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="font-semibold">Total:</span>
            <span className="text-2xl font-bold text-primary">${totalPrice}</span>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Processing..." : `Proceed to Payment ($${totalPrice})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
