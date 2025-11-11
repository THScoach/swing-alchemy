import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Square, Play, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraRecorderProps {
  onRecordingComplete: (file: File, metadata?: { contactFrame?: number; fps?: number; markAtContact?: boolean }) => void;
}

export const CameraRecorder = ({ onRecordingComplete }: CameraRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [contactFrame, setContactFrame] = useState<number | undefined>(undefined);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [markAtContact, setMarkAtContact] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 240 } },
        audio: false
      });
      setStream(mediaStream);
      setIsPreviewing(true);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (error) {
      toast({ title: "Camera Access Denied", description: "Please allow camera access", variant: "destructive" });
    }
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    setContactFrame(undefined);
    setRecordingStartTime(Date.now());
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
    mediaRecorder.onstop = () => setRecordedBlob(new Blob(chunksRef.current, { type: 'video/webm' }));
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const markContact = () => {
    const elapsedMs = Date.now() - recordingStartTime;
    setContactFrame(elapsedMs);
    toast({ title: "Contact Marked!", description: `At ${(elapsedMs / 1000).toFixed(2)}s` });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setIsPreviewing(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const useRecording = () => {
    if (!recordedBlob) return;
    const file = new File([recordedBlob], `swing-${Date.now()}.webm`, { type: 'video/webm' });
    const metadata = markAtContact 
      ? { fps: 240, contactFrame: 0, markAtContact: true }
      : contactFrame ? { contactFrame, fps: 240 } : { fps: 240 };
    onRecordingComplete(file, metadata);
    stopCamera();
  };

  const discardRecording = () => {
    setRecordedBlob(null);
    setIsPreviewing(false);
    setContactFrame(undefined);
    setMarkAtContact(false);
  };

  if (recordedBlob) {
    return (
      <Card><CardContent className="py-6"><div className="space-y-4">
        <video src={URL.createObjectURL(recordedBlob)} controls className="w-full aspect-video bg-black rounded-lg" />
        <div className="flex gap-2">
          <Button onClick={useRecording} className="flex-1" size="lg">Use This Recording</Button>
          <Button onClick={discardRecording} variant="outline" size="lg"><X className="h-4 w-4 mr-2" />Discard</Button>
        </div>
      </div></CardContent></Card>
    );
  }

  if (isPreviewing) {
    return (
      <Card><CardContent className="py-6"><div className="space-y-4">
        <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video bg-black rounded-lg" />
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer justify-center">
            <input type="checkbox" checked={markAtContact} onChange={(e) => setMarkAtContact(e.target.checked)} className="w-4 h-4" />
            <span>Mark at Contact (Frame 0 = Contact for 240fps timing)</span>
          </label>
          {!isRecording ? (
            <div className="flex gap-2">
              <Button onClick={startRecording} className="flex-1" size="lg"><Play className="h-5 w-5 mr-2" />Start Recording</Button>
              <Button onClick={stopCamera} variant="outline" size="lg"><X className="h-4 w-4" /></Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={stopRecording} variant="destructive" className="flex-1" size="lg"><Square className="h-5 w-5 mr-2" />Stop</Button>
              {!markAtContact && <Button onClick={markContact} variant="outline" className="flex-1" size="lg">Mark Contact</Button>}
            </div>
          )}
        </div>
      </div></CardContent></Card>
    );
  }

  return (
    <Card className="border-2 border-dashed"><CardContent className="py-12">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"><Camera className="h-10 w-10 text-primary" /></div>
        <div className="space-y-2"><h3 className="text-xl font-semibold">Record Video</h3><p className="text-muted-foreground">Record with 240fps camera</p></div>
        <Button size="lg" onClick={startCamera}><Camera className="h-5 w-5 mr-2" />Start Camera</Button>
      </div>
    </CardContent></Card>
  );
};
