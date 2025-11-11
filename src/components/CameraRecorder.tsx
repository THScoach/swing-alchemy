import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Square, Play, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraRecorderProps {
  onRecordingComplete: (file: File, metadata?: { contactFrame?: number; fps?: number }) => void;
}

export const CameraRecorder = ({ onRecordingComplete }: CameraRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [contactMarked, setContactMarked] = useState(false);
  const [contactFrame, setContactFrame] = useState<number | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" }, // Force back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 240, min: 30 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      setIsPreviewing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to record videos",
        variant: "destructive",
      });
    }
  };

  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    setContactMarked(false);
    setContactFrame(null);
    setRecordingStartTime(Date.now());
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const markContact = () => {
    if (!isRecording || !recordingStartTime) return;
    
    const elapsedMs = Date.now() - recordingStartTime;
    setContactFrame(elapsedMs);
    setContactMarked(true);
    
    toast({
      title: "Contact Marked!",
      description: `Contact point marked at ${(elapsedMs / 1000).toFixed(2)}s`,
    });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsPreviewing(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const useRecording = () => {
    if (recordedBlob) {
      const file = new File([recordedBlob], `recording-${Date.now()}.webm`, {
        type: 'video/webm'
      });
      const metadata = {
        contactFrame: contactFrame || undefined,
        fps: 240 // Attempted capture rate
      };
      onRecordingComplete(file, metadata);
      stopCamera();
      setRecordedBlob(null);
    }
  };

  const discardRecording = () => {
    setRecordedBlob(null);
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  if (recordedBlob) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="space-y-4">
            <video
              ref={videoRef}
              src={URL.createObjectURL(recordedBlob)}
              controls
              className="w-full aspect-video bg-black rounded-lg"
            />
            <div className="flex gap-2">
              <Button onClick={useRecording} className="flex-1" size="lg">
                Use This Recording
              </Button>
              <Button onClick={discardRecording} variant="outline" size="lg">
                <X className="h-4 w-4 mr-2" />
                Discard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPreviewing) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full aspect-video bg-black rounded-lg"
              />
              {isRecording && (
                <>
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Recording</span>
                  </div>
                  {contactMarked && (
                    <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1.5 rounded-full">
                      <span className="text-sm font-medium">✓ Contact Marked</span>
                    </div>
                  )}
                </>
              )}
              {isRecording && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <p className="text-white text-xs bg-black/50 px-3 py-1 rounded-full mb-2 text-center">
                    Tap "Mark Contact" at the exact moment bat meets ball
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {!isRecording ? (
                <>
                  <Button onClick={startRecording} className="flex-1" size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    Start Recording
                  </Button>
                  <Button onClick={stopCamera} variant="outline" size="lg">
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={markContact} 
                    variant={contactMarked ? "secondary" : "default"}
                    className="flex-1" 
                    size="lg"
                    disabled={contactMarked}
                  >
                    {contactMarked ? "Contact Marked ✓" : "Mark Contact"}
                  </Button>
                  <Button onClick={stopRecording} variant="destructive" className="flex-1" size="lg">
                    <Square className="h-5 w-5 mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed border-muted hover:border-muted-foreground/30 transition-colors">
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Record Video</h3>
            <p className="text-muted-foreground">
              Record directly from your camera
            </p>
          </div>
          <Button size="lg" onClick={startCamera}>
            <Camera className="h-5 w-5 mr-2" />
            Start Camera
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
