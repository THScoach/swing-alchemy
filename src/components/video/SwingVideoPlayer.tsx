import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Pencil,
  Minus,
  Triangle,
  Undo,
  Trash2,
  Download,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DrawingElement {
  type: 'freehand' | 'line' | 'angle';
  points: { x: number; y: number }[];
  color: string;
  angleValue?: number;
}

interface SwingVideoPlayerProps {
  videoUrl: string;
  analysisId?: string;
  showPoseOverlay?: boolean;
}

export function SwingVideoPlayer({ videoUrl, analysisId, showPoseOverlay = false }: SwingVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTool, setActiveTool] = useState<'select' | 'draw' | 'line' | 'angle'>('select');
  const [drawings, setDrawings] = useState<DrawingElement[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<{ x: number; y: number }[] | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [drawingColor] = useState('#FFD700'); // Gold color

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [drawings, currentTime]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const stepFrame = (direction: 'forward' | 'backward') => {
    const video = videoRef.current;
    if (!video) return;

    const frameTime = 1 / 30; // Assume 30fps, adjust based on actual video
    const newTime = direction === 'forward' 
      ? Math.min(video.currentTime + frameTime, duration)
      : Math.max(video.currentTime - frameTime, 0);
    
    video.currentTime = newTime;
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select') return;

    const point = getCanvasCoordinates(e);
    setCurrentDrawing([point]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentDrawing || activeTool === 'select') return;

    const point = getCanvasCoordinates(e);
    
    if (activeTool === 'draw') {
      setCurrentDrawing([...currentDrawing, point]);
    } else if (activeTool === 'line' || activeTool === 'angle') {
      setCurrentDrawing([currentDrawing[0], point]);
    }

    redrawCanvas();
    drawCurrentDrawing();
  };

  const handleCanvasMouseUp = () => {
    if (!currentDrawing || activeTool === 'select') return;

    if (activeTool === 'angle' && currentDrawing.length === 2) {
      // For angle tool, we need 3 points
      return;
    }

    if (activeTool === 'angle' && currentDrawing.length === 3) {
      // Calculate angle
      const angle = calculateAngle(currentDrawing[0], currentDrawing[1], currentDrawing[2]);
      setDrawings([...drawings, {
        type: 'angle',
        points: currentDrawing,
        color: drawingColor,
        angleValue: angle
      }]);
    } else {
      setDrawings([...drawings, {
        type: activeTool === 'draw' ? 'freehand' : 'line',
        points: currentDrawing,
        color: drawingColor
      }]);
    }

    setCurrentDrawing(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'angle' || !currentDrawing) return;

    const point = getCanvasCoordinates(e);
    
    if (currentDrawing.length === 1) {
      setCurrentDrawing([currentDrawing[0], point]);
    } else if (currentDrawing.length === 2) {
      const finalPoints = [...currentDrawing, point];
      const angle = calculateAngle(finalPoints[0], finalPoints[1], finalPoints[2]);
      
      setDrawings([...drawings, {
        type: 'angle',
        points: finalPoints,
        color: drawingColor,
        angleValue: angle
      }]);
      
      setCurrentDrawing(null);
    }
  };

  const calculateAngle = (p1: { x: number; y: number }, vertex: { x: number; y: number }, p2: { x: number; y: number }) => {
    const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
    const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
    let angle = Math.abs((angle1 - angle2) * (180 / Math.PI));
    if (angle > 180) angle = 360 - angle;
    return Math.round(angle);
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all saved drawings
    drawings.forEach(drawing => {
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (drawing.type === 'freehand') {
        ctx.beginPath();
        drawing.points.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      } else if (drawing.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        ctx.lineTo(drawing.points[1].x, drawing.points[1].y);
        ctx.stroke();
      } else if (drawing.type === 'angle' && drawing.points.length === 3) {
        // Draw angle lines
        ctx.beginPath();
        ctx.moveTo(drawing.points[1].x, drawing.points[1].y);
        ctx.lineTo(drawing.points[0].x, drawing.points[0].y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(drawing.points[1].x, drawing.points[1].y);
        ctx.lineTo(drawing.points[2].x, drawing.points[2].y);
        ctx.stroke();

        // Draw angle arc
        const radius = 40;
        const angle1 = Math.atan2(drawing.points[0].y - drawing.points[1].y, drawing.points[0].x - drawing.points[1].x);
        const angle2 = Math.atan2(drawing.points[2].y - drawing.points[1].y, drawing.points[2].x - drawing.points[1].x);
        
        ctx.beginPath();
        ctx.arc(drawing.points[1].x, drawing.points[1].y, radius, angle1, angle2);
        ctx.stroke();

        // Draw angle value
        if (drawing.angleValue) {
          ctx.fillStyle = drawing.color;
          ctx.font = 'bold 20px Arial';
          ctx.fillText(`${drawing.angleValue}°`, drawing.points[1].x + 50, drawing.points[1].y - 20);
        }
      }
    });
  };

  const drawCurrentDrawing = () => {
    if (!currentDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'draw') {
      ctx.beginPath();
      currentDrawing.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    } else if ((activeTool === 'line' || activeTool === 'angle') && currentDrawing.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(currentDrawing[0].x, currentDrawing[0].y);
      ctx.lineTo(currentDrawing[1].x, currentDrawing[1].y);
      ctx.stroke();
    }
  };

  const handleUndo = () => {
    if (drawings.length > 0) {
      setDrawings(drawings.slice(0, -1));
      toast({ title: "Undo", description: "Last drawing removed" });
    }
  };

  const handleClear = () => {
    setDrawings([]);
    toast({ title: "Cleared", description: "All drawings removed" });
  };

  const handleSaveFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Create a temporary canvas to combine video frame and drawings
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw video frame
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw overlays
    tempCtx.drawImage(canvas, 0, 0);

    // Convert to blob and download
    tempCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swing-frame-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ 
        title: "Frame Saved!", 
        description: "Frame with annotations downloaded" 
      });
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="overflow-hidden">
      <div ref={containerRef} className="relative bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video"
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;
            const canvas = canvasRef.current;
            if (canvas) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ pointerEvents: activeTool === 'select' ? 'none' : 'auto' }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onClick={handleCanvasClick}
        />
      </div>

      {/* Drawing Tools */}
      <div className="p-4 bg-card border-t space-y-4">
        {/* Tool Selection */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant={activeTool === 'draw' ? 'default' : 'outline'}
            onClick={() => setActiveTool('draw')}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Draw
          </Button>
          <Button
            size="sm"
            variant={activeTool === 'line' ? 'default' : 'outline'}
            onClick={() => setActiveTool('line')}
            className="gap-2"
          >
            <Minus className="h-4 w-4" />
            Line
          </Button>
          <Button
            size="sm"
            variant={activeTool === 'angle' ? 'default' : 'outline'}
            onClick={() => setActiveTool('angle')}
            className="gap-2"
          >
            <Triangle className="h-4 w-4" />
            Angle
          </Button>
          <div className="flex-1" />
          <Button
            size="sm"
            variant="outline"
            onClick={handleUndo}
            disabled={drawings.length === 0}
            className="gap-2"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClear}
            disabled={drawings.length === 0}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveFrame}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Save Frame
          </Button>
          {showPoseOverlay && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSkeleton(!showSkeleton)}
              className="gap-2"
            >
              {showSkeleton ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Skeleton
            </Button>
          )}
        </div>

        {/* Playback Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => stepFrame('backward')}
              disabled={currentTime === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={togglePlayPause}
              className="gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => stepFrame('forward')}
              disabled={currentTime >= duration}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-muted-foreground px-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex-1" />

            {/* Speed Controls */}
            <div className="flex gap-1">
              {[0.25, 0.5, 1].map((speed) => (
                <Button
                  key={speed}
                  size="sm"
                  variant={playbackSpeed === speed ? 'default' : 'outline'}
                  onClick={() => handleSpeedChange(speed)}
                  className="min-w-[60px]"
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>

          {/* Timeline Scrubber */}
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.01}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>
      </div>
    </Card>
  );
}
