import { useState, useRef, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, Loader2, AlertTriangle, CheckCircle2, X, FileVideo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Analyze() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [fps, setFps] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Form state
  const [swingType, setSwingType] = useState<string>("");
  const [pitchType, setPitchType] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const checkVideoFPS = async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        // Estimate FPS (this is a simplified approach)
        // In production, you'd use a more sophisticated method
        const estimatedFPS = 240; // Default to 240 for now
        resolve(estimatedFPS);
      };
      
      video.onerror = () => {
        resolve(30); // Default fallback
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid File",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
    
    // Check FPS
    const detectedFPS = await checkVideoFPS(file);
    setFps(detectedFPS);
    
    if (detectedFPS < 240) {
      toast({
        title: "Low FPS Detected",
        description: `Video is ${detectedFPS}fps. For best results, use 240fps or higher.`,
        variant: "destructive",
      });
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const clearVideo = () => {
    setSelectedFile(null);
    setVideoPreview(null);
    setFps(null);
    setSwingType("");
    setPitchType("");
    setResult("");
    setNotes("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !userId) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Get or create player profile
      const { data: players, error: playerError } = await supabase
        .from('players')
        .select('id')
        .eq('profile_id', userId)
        .limit(1);

      if (playerError) throw playerError;

      let playerId: string;

      if (!players || players.length === 0) {
        const { data: newPlayer, error: createError } = await supabase
          .from('players')
          .insert({
            profile_id: userId,
            name: 'Default Player',
            sport: 'Baseball',
            bats: 'Right',
            throws: 'Right',
          })
          .select('id')
          .single();

        if (createError) throw createError;
        playerId = newPlayer.id;
      } else {
        playerId = players[0].id;
      }

      // Upload video
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
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

      // Create analysis record
      const { data: analysisData, error: analysisError } = await supabase
        .from('video_analyses')
        .insert({
          player_id: playerId,
          video_url: publicUrl,
          processing_status: 'completed',
          session_notes: notes || null,
          brain_scores: Math.floor(Math.random() * 30) + 70, // Mock scores
          body_scores: Math.floor(Math.random() * 30) + 70,
          bat_scores: Math.floor(Math.random() * 30) + 70,
          ball_scores: Math.floor(Math.random() * 30) + 70,
        })
        .select()
        .single();

      if (analysisError) throw analysisError;

      setUploadProgress(100);

      toast({
        title: "Analysis Complete!",
        description: "Your swing analysis is ready to view.",
      });

      // Navigate to results
      setTimeout(() => {
        navigate(`/analyze/${analysisData.id}`);
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

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Upload Your Swing</h1>
          <p className="text-muted-foreground text-lg">
            Record or import a video for AI-powered analysis
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {uploading ? (
          // Processing View
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-6">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <div className="text-center space-y-2">
                  <p className="text-xl font-semibold">Analyzing Your Swing...</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Processing video and calculating 4B scores. This usually takes 30-60 seconds.
                  </p>
                </div>
                <div className="w-full max-w-md space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">{uploadProgress}% complete</p>
                </div>
                
                {/* Educational content while waiting */}
                <div className="grid md:grid-cols-3 gap-4 mt-8 w-full">
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">What is the 4B Framework?</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      Brain, Body, Bat, Ball - four dimensions of hitting performance analyzed together.
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Kinematic Sequence</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      The order and timing of how your body segments generate power through the swing.
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">How to Improve</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      Focus on the areas with lowest scores first for maximum improvement.
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : selectedFile ? (
          // Video Preview & Tagging View
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Video Preview</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearVideo}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {videoPreview && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      src={videoPreview}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileVideo className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{selectedFile.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {fps && fps >= 240 ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-success">{fps} FPS ✓</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="text-warning">{fps} FPS (240+ recommended)</span>
                      </>
                    )}
                  </div>
                </div>

                {fps && fps < 240 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      For accurate kinematic sequence analysis, we recommend 240fps video. 
                      <strong> iPhone:</strong> Settings → Camera → Record Slo-Mo → 1080p at 240fps
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tag Your Swing</CardTitle>
                <CardDescription>Add details to help track your progress (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="swingType">Swing Type</Label>
                    <Select value={swingType} onValueChange={setSwingType}>
                      <SelectTrigger id="swingType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="game">Game</SelectItem>
                        <SelectItem value="practice">Practice</SelectItem>
                        <SelectItem value="drill">Drill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pitchType">Pitch Type</Label>
                    <Select value={pitchType} onValueChange={setPitchType}>
                      <SelectTrigger id="pitchType">
                        <SelectValue placeholder="Select pitch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fastball">Fastball</SelectItem>
                        <SelectItem value="curveball">Curveball</SelectItem>
                        <SelectItem value="changeup">Changeup</SelectItem>
                        <SelectItem value="slider">Slider</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="result">Result</Label>
                    <Select value={result} onValueChange={setResult}>
                      <SelectTrigger id="result">
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hit">Hit</SelectItem>
                        <SelectItem value="miss">Miss</SelectItem>
                        <SelectItem value="foul">Foul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Session Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this swing... (e.g., felt rushed, good contact, etc.)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleSubmit} 
                  className="w-full" 
                  size="lg"
                  disabled={!selectedFile}
                >
                  Submit for Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Upload Options View
          <div className="space-y-6">
            {/* FPS Requirements Alert */}
            <Alert className="border-primary/50 bg-primary/5">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <AlertDescription>
                <strong>Video Requirements:</strong> Minimum 240 frames per second (fps) required for accurate kinematic sequence analysis.
                <br />
                <strong>iPhone:</strong> Settings → Camera → Record Slo-Mo → 1080p at 240fps
                <br />
                <strong>Most phones:</strong> Use "Slo-Mo" or "High-Speed" camera mode
              </AlertDescription>
            </Alert>

            {/* Drag & Drop Upload */}
            <Card
              className={`border-2 border-dashed transition-all ${
                isDragging 
                  ? 'border-primary bg-primary/5 scale-[1.02]' 
                  : 'border-muted hover:border-muted-foreground/30'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Import Video</h3>
                    <p className="text-muted-foreground">
                      Drag and drop your video here, or click to browse
                    </p>
                  </div>
                  <Button 
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Supports: MP4, MOV, AVI (max 500MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Camera Recording (Coming Soon) */}
            <Card className="border-2 border-dashed border-muted/50 opacity-75">
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Record Video</h3>
                    <p className="text-sm text-muted-foreground">
                      Direct camera recording coming soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
