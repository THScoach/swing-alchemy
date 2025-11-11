import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Video, X } from "lucide-react";
import { CameraRecorder } from "./CameraRecorder";
import { Progress } from "@/components/ui/progress";

interface CoachUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string;
  playerName: string;
}

export const CoachUploadModal = ({ open, onOpenChange, playerId, playerName }: CoachUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showRecorder, setShowRecorder] = useState(false);
  
  const [contextTag, setContextTag] = useState<string>("Practice");
  const [hitterSide, setHitterSide] = useState<string>("");
  const [cameraAngle, setCameraAngle] = useState<string>("");
  
  // FPS confirmation flow
  const [detectedFps, setDetectedFps] = useState<number | null>(null);
  const [manualFps, setManualFps] = useState<string>("");
  const [confirmedFps, setConfirmedFps] = useState<number | null>(null);
  const [hasConfirmedFps, setHasConfirmedFps] = useState(false);
  
  const [notes, setNotes] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const tryDetectFps = async (video: HTMLVideoElement, filename: string): Promise<number | null> => {
    const name = filename.toLowerCase();

    // 1) Filename hints
    if (name.includes("300fps") || name.includes("300-fps") || name.includes("@300")) return 300;
    if (name.includes("240fps") || name.includes("240-fps") || name.includes("@240")) return 240;
    if (name.includes("120fps") || name.includes("120-fps") || name.includes("@120")) return 120;
    if (name.includes("90fps") || name.includes("90-fps") || name.includes("@90")) return 90;
    if (name.includes("60fps") || name.includes("60-fps") || name.includes("@60")) return 60;
    if (name.includes("30fps") || name.includes("30-fps") || name.includes("@30")) return 30;

    // 2) Stream metadata (browser support dependent)
    try {
      // @ts-ignore - captureStream may not be available in all browsers
      const stream = video.captureStream?.();
      const track = stream?.getVideoTracks?.()[0];
      const fr = track?.getSettings?.().frameRate;

      if (typeof fr === "number" && fr > 10 && fr < 500) {
        return fr;
      }
    } catch (err) {
      console.warn("captureStream FPS detection failed", err);
    }

    // 3) Fallback: unknown -> caller will default
    return null;
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid File",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowRecorder(false);

    // Reset FPS confirmation state for new file
    setDetectedFps(null);
    setManualFps("");
    setConfirmedFps(null);
    setHasConfirmedFps(false);

    // Use off-DOM video element for FPS detection
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.src = url;

    probe.onloadedmetadata = async () => {
      try {
        const guess = await tryDetectFps(probe, file.name);
        let fallback = 60;
        
        // If very short video (<1s), default to 240fps
        if (probe.duration > 0 && probe.duration < 1) {
          fallback = 240;
        }
        
        const detected = guess && guess > 0 ? Math.round(guess) : fallback;
        setDetectedFps(detected);
        setManualFps(String(detected));
      } catch (e) {
        console.warn("FPS detection failed, defaulting to 60fps", e);
        setDetectedFps(60);
        setManualFps("60");
      }
    };
  };

  const handleRecordingComplete = (file: File) => {
    handleFileSelect(file);
  };

  const handleConfirmFps = () => {
    const chosen = manualFps ? Number(manualFps) : detectedFps;
    
    if (!chosen || chosen <= 0) {
      toast({
        title: "Invalid Frame Rate",
        description: "Please enter or confirm a valid frame rate.",
        variant: "destructive",
      });
      return;
    }

    // Warn for low FPS
    if (chosen < 30) {
      toast({
        title: "Low Frame Rate Warning",
        description: "For accurate body/sequence metrics, use ≥120 fps if possible.",
        variant: "destructive",
      });
    }

    // Clamp to max 480
    const clamped = Math.min(chosen, 480);
    
    setConfirmedFps(clamped);
    setHasConfirmedFps(true);
    
    toast({
      title: "FPS Confirmed",
      description: `Frame rate set to ${clamped} fps`,
    });
  };

  const handleSubmit = async () => {
    if (!selectedFile || !hasConfirmedFps || !confirmedFps) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload video
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `coach-uploads/${playerId}/${Date.now()}.${fileExt}`;
      
      setUploadProgress(30);
      
      const { error: uploadError } = await supabase.storage
        .from('swing-videos')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('swing-videos')
        .getPublicUrl(fileName);

      // Create analysis record with confirmed FPS
      const { error: analysisError } = await supabase
        .from('video_analyses')
        .insert({
          player_id: playerId,
          video_url: publicUrl,
          uploaded_by: user.id,
          processing_status: 'pending',
          context_tag: contextTag as any,
          hitter_side: hitterSide || null,
          camera_angle: cameraAngle || null,
          fps: confirmedFps,
          raw_fps_guess: detectedFps,
          session_notes: notes || null,
        });

      if (analysisError) throw analysisError;

      setUploadProgress(100);

      toast({
        title: "Upload Complete",
        description: `Video uploaded for ${playerName}`,
      });

      // Reset and close
      setTimeout(() => {
        handleReset();
        onOpenChange(false);
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setContextTag("Practice");
    setHitterSide("");
    setCameraAngle("");
    setDetectedFps(null);
    setManualFps("");
    setConfirmedFps(null);
    setHasConfirmedFps(false);
    setNotes("");
    setUploading(false);
    setUploadProgress(0);
    setShowRecorder(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Swing for {playerName}</DialogTitle>
          <DialogDescription>
            Record or upload a video for this player's swing analysis
          </DialogDescription>
        </DialogHeader>

        {uploading ? (
          <div className="space-y-4 py-8">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              Uploading video... {uploadProgress}%
            </p>
          </div>
        ) : selectedFile ? (
          <div className="space-y-4">
            <div className="relative">
              <video
                src={previewUrl}
                controls
                className="w-full aspect-video bg-black rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleReset}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Context</Label>
                <Select value={contextTag} onValueChange={setContextTag}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Game">Game</SelectItem>
                    <SelectItem value="Practice">Practice</SelectItem>
                    <SelectItem value="Drill">Drill</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hitter Side</Label>
                <Select value={hitterSide} onValueChange={setHitterSide}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="R">Right</SelectItem>
                    <SelectItem value="L">Left</SelectItem>
                    <SelectItem value="S">Switch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Camera Angle</Label>
                <Select value={cameraAngle} onValueChange={setCameraAngle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open Side">Open Side</SelectItem>
                    <SelectItem value="Closed Side">Closed Side</SelectItem>
                    <SelectItem value="Behind">Behind</SelectItem>
                    <SelectItem value="Overhead">Overhead</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Frame Rate (FPS) *</Label>
                <p className="text-xs text-muted-foreground">
                  Detected: <strong>{detectedFps ?? '—'} fps</strong> (please confirm or override)
                </p>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={10}
                    max={480}
                    placeholder="Enter actual FPS (e.g. 120, 240, 300)"
                    value={manualFps}
                    onChange={(e) => setManualFps(e.target.value)}
                    disabled={hasConfirmedFps}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleConfirmFps}
                    disabled={hasConfirmedFps}
                    variant={hasConfirmedFps ? "secondary" : "default"}
                  >
                    {hasConfirmedFps ? `✓ Confirmed (${confirmedFps} fps)` : "Confirm FPS"}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {[480, 300, 240, 120, 90, 60, 30].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setManualFps(String(v))}
                      disabled={hasConfirmedFps}
                      className={`px-2 py-1 rounded text-xs border transition-colors disabled:opacity-50 ${
                        manualFps === String(v)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {v} fps
                    </button>
                  ))}
                </div>

                {hasConfirmedFps && confirmedFps && confirmedFps < 120 && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">
                    ⚠️ For Reboot-style analysis, ≥120 fps recommended (ideally 240+)
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Add any notes about this swing..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              className="w-full" 
              size="lg"
              disabled={!hasConfirmedFps}
            >
              {hasConfirmedFps ? "Upload & Analyze" : "Confirm FPS First"}
            </Button>
          </div>
        ) : showRecorder ? (
          <CameraRecorder onRecordingComplete={handleRecordingComplete} />
        ) : (
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-32"
              onClick={() => setShowRecorder(true)}
            >
              <div className="flex flex-col items-center gap-2">
                <Video className="h-8 w-8" />
                <span>Record Video</span>
              </div>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-32"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8" />
                <span>Upload Video File</span>
              </div>
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
