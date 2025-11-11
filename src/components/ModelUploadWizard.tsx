import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";

interface ModelProfile {
  id?: string;
  player_name: string;
  level: string;
  handedness: string;
  team?: string;
  height_inches?: number;
  weight_lbs?: number;
}

interface ModelUploadWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  existingModels: Array<{ player_name: string; level: string; handedness: string }>;
}

export const ModelUploadWizard = ({ open, onOpenChange, onComplete, existingModels }: ModelUploadWizardProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  
  // Step 1 - Model Profile
  const [isNewModel, setIsNewModel] = useState(true);
  const [selectedExisting, setSelectedExisting] = useState<string>("");
  const [modelProfile, setModelProfile] = useState<ModelProfile>({
    player_name: '',
    level: '',
    handedness: 'R',
    team: '',
  });

  // Step 2 - Session Details
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionLabel, setSessionLabel] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');

  // Step 3 - FPS Confirmation
  const [fpsConfirmed, setFpsConfirmed] = useState<number | null>(null);
  const [manualFps, setManualFps] = useState<string>("240");

  // Step 4 - Upload Videos
  const [files, setFiles] = useState<File[]>([]);

  const resetForm = () => {
    setStep(1);
    setIsNewModel(true);
    setSelectedExisting("");
    setModelProfile({ player_name: '', level: '', handedness: 'R', team: '' });
    setSessionDate(new Date().toISOString().split('T')[0]);
    setSessionLabel('');
    setSessionNotes('');
    setFpsConfirmed(null);
    setManualFps("240");
    setFiles([]);
  };

  const canProceedStep1 = () => {
    if (isNewModel) {
      return modelProfile.player_name && modelProfile.level && modelProfile.handedness;
    }
    return selectedExisting !== "";
  };

  const canProceedStep3 = () => fpsConfirmed !== null;
  const canProceedStep4 = () => files.length >= 1 && files.length <= 6;

  const handleNext = () => {
    if (step === 1 && !canProceedStep1()) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields for the model profile.",
        variant: "destructive",
      });
      return;
    }
    if (step === 3 && !canProceedStep3()) {
      toast({
        title: "FPS Required",
        description: "Please confirm the video frame rate.",
        variant: "destructive",
      });
      return;
    }
    if (step === 4 && !canProceedStep4()) {
      toast({
        title: "Videos Required",
        description: "Please upload 1-6 video files.",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      let successCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const ext = file.name.split('.').pop() || 'mp4';
          const path = `pro-swings/${user.id}/${Date.now()}-${modelProfile.player_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}-${i}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('pro-swings')
            .upload(path, file, { cacheControl: '3600', upsert: false });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('pro-swings')
            .getPublicUrl(path);

          const label = sessionLabel || `${modelProfile.player_name} - Swing ${i + 1}`;

          const { error: insertError } = await supabase
            .from('pro_swings')
            .insert({
              label: files.length > 1 ? `${label} (${i + 1})` : label,
              description: sessionNotes || undefined,
              handedness: modelProfile.handedness,
              level: modelProfile.level,
              video_url: publicUrl,
              player_name: modelProfile.player_name,
              team: modelProfile.team || null,
              height_inches: modelProfile.height_inches || null,
              weight_lbs: modelProfile.weight_lbs || null,
              is_model: true,
              fps: fpsConfirmed,
              fps_confirmed: fpsConfirmed,
              organization_id: orgMember?.organization_id ?? null,
              created_by: user.id,
            });

          if (!insertError) successCount++;
        } catch (err) {
          console.error('Error processing file:', err);
        }
      }

      if (successCount === 0) {
        throw new Error('Failed to upload any files');
      }

      toast({
        title: "Model Swings Uploaded",
        description: `Successfully uploaded ${successCount} of ${files.length} swing(s).`,
      });

      resetForm();
      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload model swings.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Model Swing - Step {step} of 4</DialogTitle>
          <DialogDescription>
            {step === 1 && "Select or create a model profile"}
            {step === 2 && "Add session details"}
            {step === 3 && "Confirm video frame rate"}
            {step === 4 && "Upload swing videos"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step 1 - Model Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={isNewModel ? "default" : "outline"}
                  onClick={() => setIsNewModel(true)}
                  className="flex-1"
                >
                  Create New Model
                </Button>
                <Button
                  type="button"
                  variant={!isNewModel ? "default" : "outline"}
                  onClick={() => setIsNewModel(false)}
                  className="flex-1"
                >
                  Use Existing Model
                </Button>
              </div>

              {isNewModel ? (
                <>
                  <div>
                    <Label htmlFor="player_name">Player Name *</Label>
                    <Input
                      id="player_name"
                      placeholder="e.g., Freddie Freeman"
                      value={modelProfile.player_name}
                      onChange={(e) => setModelProfile({ ...modelProfile, player_name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="level">Level *</Label>
                      <Select value={modelProfile.level} onValueChange={(value) => setModelProfile({ ...modelProfile, level: value })}>
                        <SelectTrigger id="level">
                          <SelectValue placeholder="Select level..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MLB">MLB</SelectItem>
                          <SelectItem value="Pro">Pro</SelectItem>
                          <SelectItem value="MiLB">MiLB</SelectItem>
                          <SelectItem value="College">College</SelectItem>
                          <SelectItem value="HS">High School</SelectItem>
                          <SelectItem value="Youth">Youth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="handedness">Handedness *</Label>
                      <Select value={modelProfile.handedness} onValueChange={(value) => setModelProfile({ ...modelProfile, handedness: value })}>
                        <SelectTrigger id="handedness">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="R">Right Handed</SelectItem>
                          <SelectItem value="L">Left Handed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="team">Team</Label>
                    <Input
                      id="team"
                      placeholder="e.g., Dodgers"
                      value={modelProfile.team}
                      onChange={(e) => setModelProfile({ ...modelProfile, team: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height">Height (inches)</Label>
                      <Input
                        id="height"
                        type="number"
                        min={55}
                        max={82}
                        placeholder="e.g., 77"
                        value={modelProfile.height_inches || ''}
                        onChange={(e) => setModelProfile({ ...modelProfile, height_inches: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (lbs)</Label>
                      <Input
                        id="weight"
                        type="number"
                        min={120}
                        max={280}
                        placeholder="e.g., 215"
                        value={modelProfile.weight_lbs || ''}
                        onChange={(e) => setModelProfile({ ...modelProfile, weight_lbs: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="existing_model">Select Existing Model</Label>
                  <Select value={selectedExisting} onValueChange={setSelectedExisting}>
                    <SelectTrigger id="existing_model">
                      <SelectValue placeholder="Choose a model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {existingModels.map((model, idx) => (
                        <SelectItem key={idx} value={`${model.player_name}-${model.level}-${model.handedness}`}>
                          {model.player_name} ({model.level}, {model.handedness})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Step 2 - Session Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="session_date">Session Date</Label>
                <Input
                  id="session_date"
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="session_label">Session Label (Optional)</Label>
                <Input
                  id="session_label"
                  placeholder="e.g., HR swing vs RHP"
                  value={sessionLabel}
                  onChange={(e) => setSessionLabel(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="session_notes">Notes (Optional)</Label>
                <Textarea
                  id="session_notes"
                  placeholder="Add any relevant notes about this session..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3 - FPS Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Movement Type</h3>
                <Badge>Hitting</Badge>
              </div>
              
              <div>
                <Label htmlFor="fps_manual">Frame Rate (FPS) *</Label>
                <Input
                  id="fps_manual"
                  type="number"
                  min={24}
                  max={960}
                  placeholder="Enter FPS"
                  value={manualFps}
                  onChange={(e) => setManualFps(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the confirmed frame rate of your video
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Label className="w-full text-sm">Quick Select:</Label>
                {[480, 300, 240, 120, 60, 30].map((fps) => (
                  <Button
                    key={fps}
                    type="button"
                    variant={fpsConfirmed === fps ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setManualFps(fps.toString());
                      setFpsConfirmed(fps);
                    }}
                  >
                    {fps} FPS
                  </Button>
                ))}
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  const fps = parseInt(manualFps);
                  if (fps >= 24 && fps <= 960) {
                    setFpsConfirmed(fps);
                    toast({
                      title: "FPS Confirmed",
                      description: `Frame rate set to ${fps} FPS`,
                    });
                  } else {
                    toast({
                      title: "Invalid FPS",
                      description: "Please enter a value between 24 and 960",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Confirm {manualFps} FPS
              </Button>

              {fpsConfirmed && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    ✓ FPS Confirmed: {fpsConfirmed}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4 - Upload Videos */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Ready to Upload:</p>
                <p className="text-sm text-muted-foreground">
                  Model: <strong>{modelProfile.player_name}</strong> ({modelProfile.level}, {modelProfile.handedness})
                </p>
                <p className="text-sm text-muted-foreground">
                  FPS: <strong>{fpsConfirmed}</strong>
                </p>
              </div>

              <div>
                <Label htmlFor="video_files">Upload Video Files (1-6) *</Label>
                <Input
                  id="video_files"
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files || []).slice(0, 6);
                    setFiles(selectedFiles);
                  }}
                />
                {files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">{files.length} file(s) selected:</p>
                    {files.map((file, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground">
                        {idx + 1}. {file.name}
                      </p>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Upload 1-6 swing videos (like Reboot)
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 1) {
                resetForm();
                onOpenChange(false);
              } else {
                setStep(step - 1);
              }
            }}
            disabled={uploading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step < 4 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleUpload} disabled={!canProceedStep4() || uploading}>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
