import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Play, Loader2, ExternalLink } from "lucide-react";
import type { Drill, DrillCategory, DrillPriority } from "@/lib/drillPrescription";

interface DrillEditorProps {
  drill: Drill | null;
  onSave: () => void;
  onCancel: () => void;
}

// Checklist items for targeting
const CHECKLIST_ITEMS = [
  // Anchor metrics
  { id: '1.1', label: 'Rear Leg Brake Force' },
  { id: '1.2', label: 'COM Stays Back' },
  { id: '1.3', label: 'Negative Move Control' },
  { id: '1.4', label: 'Rear Hip Back Pocket' },
  { id: '1.5', label: 'Head Stable Vertical' },
  { id: '1.6', label: 'Foot Down Position' },
  { id: '1.7', label: 'Pelvis Sway Minimal' },
  { id: '1.8', label: 'Back Leg Angle Braced' },
  { id: '1.9', label: 'Front Leg Stable' },
  { id: '1.10', label: 'Anchor Consistency' },
  // Stability metrics
  { id: '2.1', label: 'Pelvis Peak Timing' },
  { id: '2.2', label: 'Torso Peak Timing' },
  { id: '2.3', label: 'Lead Arm Peak Timing' },
  { id: '2.4', label: 'Hands Peak Timing' },
  { id: '2.5', label: 'Peak Succession Delay' },
  { id: '2.6', label: 'Torso Rotational Control' },
  { id: '2.7', label: 'Trunk Tilt Consistency' },
  { id: '2.8', label: 'Shoulder Plane Match' },
  { id: '2.9', label: 'Lead Arm Path Efficiency' },
  { id: '2.10', label: 'Stability Overall' },
  // Whip metrics
  { id: '3.1', label: 'Hand Accel After Torso Decel' },
  { id: '3.2', label: 'Bat Lag Angle Maintenance' },
  { id: '3.3', label: 'Arc Radius Efficiency' },
  { id: '3.4', label: 'Distal Segment Whip' },
  { id: '3.5', label: 'Whip Overall' },
];

export function DrillEditor({ drill, onSave, onCancel }: DrillEditorProps) {
  const [formData, setFormData] = useState({
    title: drill?.title || '',
    category: drill?.category || 'anchor' as DrillCategory,
    priority_level: drill?.priority_level || 'moderate' as DrillPriority,
    description: drill?.description || '',
    simple_explanation: drill?.simple_explanation || '',
    coach_rick_says: drill?.coach_rick_says || '',
    progression: drill?.progression || '',
    video_url: drill?.video_url || '',
    focus_metric: drill?.focus_metric || '',
    difficulty: drill?.difficulty || '',
    duration_minutes: drill?.duration_minutes || undefined,
    targets: drill?.targets || [] as string[],
    coaching_cues: drill?.coaching_cues || [] as string[],
    checklist_items_trained: drill?.checklist_items_trained || [] as string[],
    prescription_triggers: drill?.prescription_triggers || [] as string[],
    contraindications: drill?.contraindications || [] as string[],
  });

  const [coachingCuesText, setCoachingCuesText] = useState(
    drill?.coaching_cues?.join('\n') || ''
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Drill name and category are required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Upload video if there's a new file
      let videoUrl = formData.video_url;
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('drill-videos')
          .upload(filePath, videoFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('drill-videos')
          .getPublicUrl(filePath);

        videoUrl = publicUrl;
      }

      // Parse coaching cues from text
      const coaching_cues = coachingCuesText
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim());

      const drillData = {
        ...formData,
        video_url: videoUrl,
        coaching_cues,
      };

      if (drill?.id) {
        // Update existing drill
        const { error } = await supabase
          .from('drills')
          .update(drillData)
          .eq('id', drill.id);

        if (error) throw error;

        toast({
          title: "Drill updated",
          description: "The drill has been successfully updated.",
        });
      } else {
        // Create new drill
        const { error } = await supabase
          .from('drills')
          .insert([drillData]);

        if (error) throw error;

        toast({
          title: "Drill created",
          description: "The drill has been successfully created.",
        });
      }

      onSave();
    } catch (error: any) {
      toast({
        title: "Error saving drill",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          title: "File too large",
          description: "Video files must be under 100MB.",
          variant: "destructive",
        });
        return;
      }
      setVideoFile(file);
    }
  };

  const toggleTarget = (targetId: string) => {
    setFormData(prev => ({
      ...prev,
      targets: prev.targets.includes(targetId)
        ? prev.targets.filter(t => t !== targetId)
        : [...prev.targets, targetId]
    }));
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-brand-gold">
            {drill?.id ? 'Edit Drill' : 'Create New Drill'}
          </CardTitle>
          <CardDescription>
            Fill in the details for this training drill
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Drill Name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Med Ball Wall Rotation Drill"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: DrillCategory) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anchor">Anchor</SelectItem>
                      <SelectItem value="stability">Stability</SelectItem>
                      <SelectItem value="whip">Whip</SelectItem>
                      <SelectItem value="multi">Multi-Pillar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select
                    value={formData.priority_level}
                    onValueChange={(value: DrillPriority) => setFormData({ ...formData, priority_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very_high">Very High</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Technical description of the drill..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="simple_explanation">Simple Explanation (for athletes)</Label>
                <Textarea
                  id="simple_explanation"
                  value={formData.simple_explanation}
                  onChange={(e) => setFormData({ ...formData, simple_explanation: e.target.value })}
                  placeholder="Explain what this drill does in simple terms..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="coach_rick_says">Coach Rick Says</Label>
                <Textarea
                  id="coach_rick_says"
                  value={formData.coach_rick_says}
                  onChange={(e) => setFormData({ ...formData, coach_rick_says: e.target.value })}
                  placeholder="Coach Rick's personal tip or cue for this drill..."
                  rows={2}
                />
              </div>
            </div>

            {/* Targets */}
            <div>
              <Label>Target Metrics (Select all that apply)</Label>
              <div className="mt-2 p-4 border border-border rounded-lg space-y-2 max-h-60 overflow-y-auto">
                {CHECKLIST_ITEMS.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`target-${item.id}`}
                      checked={formData.targets.includes(item.id)}
                      onChange={() => toggleTarget(item.id)}
                      className="rounded"
                    />
                    <label htmlFor={`target-${item.id}`} className="text-sm cursor-pointer">
                      <Badge variant="outline" className="mr-2">{item.id}</Badge>
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Coaching Cues */}
            <div>
              <Label htmlFor="coaching_cues">Coaching Cues (one per line)</Label>
              <Textarea
                id="coaching_cues"
                value={coachingCuesText}
                onChange={(e) => setCoachingCuesText(e.target.value)}
                placeholder="Feel your back leg braking&#10;Keep your head quiet&#10;Let the barrel whip through"
                rows={4}
              />
            </div>

            {/* Progression */}
            <div>
              <Label htmlFor="progression">Progression</Label>
              <Textarea
                id="progression"
                value={formData.progression}
                onChange={(e) => setFormData({ ...formData, progression: e.target.value })}
                placeholder="How to progress this drill over weeks 1-6..."
                rows={3}
              />
            </div>

            {/* Video Upload */}
            <div className="space-y-4">
              <Label>Drill Video</Label>
              
              {/* Manual URL Entry */}
              <div>
                <Label htmlFor="video_url" className="text-sm text-muted-foreground">
                  Or enter external video URL (YouTube, Vimeo)
                </Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-border rounded-lg p-6">
                <div className="text-center">
                  {videoFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Play className="h-5 w-5 text-brand-gold" />
                        <span className="font-medium">{videoFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setVideoFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : formData.video_url && !formData.video_url.includes('youtube') && !formData.video_url.includes('vimeo') ? (
                    <div className="space-y-2">
                      <video
                        src={formData.video_url}
                        controls
                        className="mx-auto max-h-40 rounded"
                      />
                      <p className="text-sm text-muted-foreground">Current video</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Upload drill video (MP4, MOV, max 100MB)
                      </p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="mt-4"
                  />
                </div>
              </div>
            </div>

            {/* Contraindications */}
            <div>
              <Label htmlFor="contraindications">Contraindications (optional)</Label>
              <Textarea
                id="contraindications"
                value={formData.contraindications.join('\n')}
                onChange={(e) => setFormData({
                  ...formData,
                  contraindications: e.target.value.split('\n').filter(l => l.trim())
                })}
                placeholder="List any situations where this drill should not be used..."
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {drill?.id ? 'Update Drill' : 'Create Drill'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
