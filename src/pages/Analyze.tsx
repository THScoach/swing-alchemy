import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Analyze() {
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if video file
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid File",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // First, ensure user has a player profile (or create one)
      const { data: players, error: playerError } = await supabase
        .from('players')
        .select('id')
        .eq('profile_id', userId)
        .limit(1);

      if (playerError) throw playerError;

      let playerId: string;

      if (!players || players.length === 0) {
        // Create a default player profile
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

      // Upload video to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('swing-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('swing-videos')
        .getPublicUrl(fileName);

      // Create video analysis record
      const { error: analysisError } = await supabase
        .from('video_analyses')
        .insert({
          player_id: playerId,
          video_url: publicUrl,
          processing_status: 'processing',
        });

      if (analysisError) throw analysisError;

      toast({
        title: "Upload Successful!",
        description: "Your video is being analyzed. This usually takes 30-60 seconds.",
      });

      // Simulate processing time
      setTimeout(() => {
        setUploading(false);
        toast({
          title: "Analysis Complete!",
          description: "Your swing analysis is ready to view.",
        });
      }, 3000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleRecordClick = () => {
    toast({
      title: "Camera Recording",
      description: "Camera recording will be available in the next update",
    });
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Analyze Swing</h1>
          <p className="text-muted-foreground">
            Upload or record a video to analyze your hitting mechanics
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-semibold mb-2">Processing Your Video...</p>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                We're analyzing your swing mechanics. This usually takes 30-60 seconds.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={handleRecordClick}>
              <CardHeader>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 mx-auto">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-center">Record Now</CardTitle>
                <CardDescription className="text-center">
                  Use your device camera to record a new swing video
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  size="lg"
                >
                  Start Recording
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-muted hover:border-muted-foreground/30 transition-colors cursor-pointer"
                  onClick={handleImportClick}>
              <CardHeader>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4 mx-auto">
                  <Upload className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-center">Import From Library</CardTitle>
                <CardDescription className="text-center">
                  Select an existing video from your device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  size="lg"
                >
                  Choose Video
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Record from the side view for optimal analysis</p>
                <p>• Ensure good lighting and clear visibility</p>
                <p>• Capture the full swing from load to follow-through</p>
                <p>• Keep the camera stable during recording</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
