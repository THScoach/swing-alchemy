import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface EquipmentSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string;
  onComplete?: () => void;
}

export function EquipmentSetupModal({ open, onOpenChange, playerId, onComplete }: EquipmentSetupModalProps) {
  const [swingSensors, setSwingSensors] = useState<string[]>([]);
  const [ballTrackers, setBallTrackers] = useState<string[]>([]);
  const [motionTools, setMotionTools] = useState<string[]>([]);
  const [trainingFacility, setTrainingFacility] = useState<string>("");
  const [setupPhoto, setSetupPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSetupPhoto(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = null;

      // Upload photo if provided
      if (setupPhoto) {
        const fileExt = setupPhoto.name.split('.').pop();
        const fileName = `${playerId}-setup-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('swing-videos')
          .upload(fileName, setupPhoto);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('swing-videos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Check if equipment profile exists
      const { data: existing } = await supabase
        .from('player_equipment_profile')
        .select('id')
        .eq('player_id', playerId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('player_equipment_profile')
          .update({
            swing_sensors: swingSensors,
            ball_trackers: ballTrackers,
            motion_tools: motionTools,
            training_facility: trainingFacility,
            setup_photo_url: photoUrl || existing.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('player_equipment_profile')
          .insert({
            player_id: playerId,
            swing_sensors: swingSensors,
            ball_trackers: ballTrackers,
            motion_tools: motionTools,
            training_facility: trainingFacility,
            setup_photo_url: photoUrl
          });

        if (error) throw error;
      }

      toast.success("Equipment setup saved!");
      onComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Equipment setup error:', error);
      toast.error("Failed to save equipment setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🎯 Training Setup – Tell Us What You Use</DialogTitle>
          <DialogDescription>
            Help us understand your training environment and equipment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Swing Sensors */}
          <div className="space-y-3">
            <Label>Swing Sensors (select all that apply)</Label>
            <div className="space-y-2">
              {['STACK Bat', 'Blast Motion', 'Diamond Kinetics', 'None'].map((sensor) => (
                <div key={sensor} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sensor-${sensor}`}
                    checked={swingSensors.includes(sensor)}
                    onCheckedChange={() => toggleArrayItem(swingSensors, sensor, setSwingSensors)}
                  />
                  <label htmlFor={`sensor-${sensor}`} className="text-sm cursor-pointer">
                    {sensor}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Ball Trackers */}
          <div className="space-y-3">
            <Label>Ball-Flight Trackers (select all that apply)</Label>
            <div className="space-y-2">
              {['Pocket Radar', 'HitTrax', 'Rapsodo', 'TrackMan', 'None'].map((tracker) => (
                <div key={tracker} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tracker-${tracker}`}
                    checked={ballTrackers.includes(tracker)}
                    onCheckedChange={() => toggleArrayItem(ballTrackers, tracker, setBallTrackers)}
                  />
                  <label htmlFor={`tracker-${tracker}`} className="text-sm cursor-pointer">
                    {tracker}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Motion Capture */}
          <div className="space-y-3">
            <Label>Motion-Capture Tools (select all that apply)</Label>
            <div className="space-y-2">
              {['Reboot Motion', 'Kinetrax / IVY', 'None'].map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={`motion-${tool}`}
                    checked={motionTools.includes(tool)}
                    onCheckedChange={() => toggleArrayItem(motionTools, tool, setMotionTools)}
                  />
                  <label htmlFor={`motion-${tool}`} className="text-sm cursor-pointer">
                    {tool}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Training Environment */}
          <div className="space-y-2">
            <Label htmlFor="facility">Training Environment</Label>
            <Select value={trainingFacility} onValueChange={setTrainingFacility}>
              <SelectTrigger id="facility">
                <SelectValue placeholder="Select your training location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private-cage">Private Cage / Academy</SelectItem>
                <SelectItem value="school">School / College Facility</SelectItem>
                <SelectItem value="home">At-Home Setup</SelectItem>
                <SelectItem value="outdoor">Outdoor Field</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="photo">Upload Setup Photo (Optional)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="flex-1"
              />
              {setupPhoto && (
                <span className="text-sm text-success flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  Ready
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Skip for Now
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Equipment Setup"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
