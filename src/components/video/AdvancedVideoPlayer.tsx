import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  EyeOff,
  GitCompare,
  Maximize2,
  MapPin,
  Layers
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DrawingElement {
  type: 'freehand' | 'line' | 'angle' | 'marker';
  points: { x: number; y: number }[];
  color: string;
  angleValue?: number;
  label?: string;
  frame?: number;
}

interface AdvancedVideoPlayerProps {
  videoUrl: string;
  compareVideoUrl?: string;
  analysisId?: string;
  showPoseOverlay?: boolean;
  skeletonData?: any;
}

export function AdvancedVideoPlayer({ 
  videoUrl, 
  compareVideoUrl,
  analysisId, 
  showPoseOverlay = false,
  skeletonData
}: AdvancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const compareVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compareCanvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTool, setActiveTool] = useState<'select' | 'draw' | 'line' | 'angle' | 'marker'>('select');
  const [drawings, setDrawings] = useState<DrawingElement[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<{ x: number; y: number }[] | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showGhostOverlay, setShowGhostOverlay] = useState(false);
  const [splitView, setSplitView] = useState(!!compareVideoUrl);
  const [markers, setMarkers] = useState<{ frame: number; label: string; x: number; y: number }[]>([]);
  const [drawingColor] = useState('#FFD700');
  const [ghostOpacity, setGhostOpacity] = useState(0.5);
  const [templateMode, setTemplateMode] = useState<'posture' | 'base' | 'hip-shoulder' | 'bat-plane' | null>(null);
  const [templatePoints, setTemplatePoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      // Sync compare video if enabled
      if (splitView && compareVideoRef.current && Math.abs(compareVideoRef.current.currentTime - video.currentTime) > 0.1) {
        compareVideoRef.current.currentTime = video.currentTime;
      }
    };
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
  }, [splitView]);

  useEffect(() => {
    redrawCanvas();
  }, [drawings, currentTime, showSkeleton, showGhostOverlay, markers]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    const compareVideo = compareVideoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      if (splitView && compareVideo) compareVideo.pause();
    } else {
      video.play();
      if (splitView && compareVideo) compareVideo.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    const compareVideo = compareVideoRef.current;
    if (!video) return;
    
    video.playbackRate = speed;
    if (splitView && compareVideo) compareVideo.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const stepFrame = (direction: 'forward' | 'backward') => {
    const video = videoRef.current;
    const compareVideo = compareVideoRef.current;
    if (!video) return;

    const frameTime = 1 / 30; // Assume 30fps
    const newTime = direction === 'forward' 
      ? Math.min(video.currentTime + frameTime, duration)
      : Math.max(video.currentTime - frameTime, 0);
    
    video.currentTime = newTime;
    if (splitView && compareVideo) compareVideo.currentTime = newTime;
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    const compareVideo = compareVideoRef.current;
    if (!video) return;
    
    video.currentTime = value[0];
    if (splitView && compareVideo) compareVideo.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasCoordinates(e, canvas);
    setCurrentDrawing([point]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentDrawing || activeTool === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = getCanvasCoordinates(e, canvas);
    
    if (activeTool === 'draw') {
      setCurrentDrawing([...currentDrawing, point]);
    } else {
      setCurrentDrawing([currentDrawing[0], point]);
    }

    redrawCanvas();
    drawCurrentDrawing();
  };

  const handleCanvasMouseUp = () => {
    if (!currentDrawing || activeTool === 'select') return;

    if (activeTool === 'marker') {
      // Add marker at this location
      const frameNum = Math.floor(currentTime * 30); // Assume 30fps
      setMarkers([...markers, {
        frame: frameNum,
        label: `M${markers.length + 1}`,
        x: currentDrawing[0].x,
        y: currentDrawing[0].y
      }]);
      setCurrentDrawing(null);
      return;
    }

    if (activeTool === 'angle' && currentDrawing.length < 3) {
      return;
    }

    if (activeTool === 'angle' && currentDrawing.length === 3) {
      const angle = calculateAngle(currentDrawing[0], currentDrawing[1], currentDrawing[2]);
      setDrawings([...drawings, {
        type: 'angle',
        points: currentDrawing,
        color: drawingColor,
        angleValue: angle,
        frame: Math.floor(currentTime * 30)
      }]);
    } else {
      setDrawings([...drawings, {
        type: activeTool === 'draw' ? 'freehand' : 'line',
        points: currentDrawing,
        color: drawingColor,
        frame: Math.floor(currentTime * 30)
      }]);
    }

    setCurrentDrawing(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'angle' && activeTool !== 'marker' && !templateMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = getCanvasCoordinates(e, canvas);

    // Handle template mode
    if (templateMode) {
      const newPoints = [...templatePoints, point];
      setTemplatePoints(newPoints);

      const pointsNeeded = templateMode === 'hip-shoulder' ? 3 : 2;
      
      if (newPoints.length === pointsNeeded) {
        applyInteractiveTemplate(templateMode, newPoints);
        setTemplateMode(null);
        setTemplatePoints([]);
      }
      return;
    }

    if (activeTool === 'marker') {
      const frameNum = Math.floor(currentTime * 30);
      setMarkers([...markers, {
        frame: frameNum,
        label: `M${markers.length + 1}`,
        x: point.x,
        y: point.y
      }]);
      toast({ title: "Marker Added", description: `Frame ${frameNum}` });
      return;
    }

    if (activeTool === 'angle') {
      if (!currentDrawing) {
        setCurrentDrawing([point]);
      } else if (currentDrawing.length === 1) {
        setCurrentDrawing([...currentDrawing, point]);
      } else if (currentDrawing.length === 2) {
        const finalPoints = [...currentDrawing, point];
        const angle = calculateAngle(finalPoints[0], finalPoints[1], finalPoints[2]);
        
        setDrawings([...drawings, {
          type: 'angle',
          points: finalPoints,
          color: drawingColor,
          angleValue: angle,
          frame: Math.floor(currentTime * 30)
        }]);
        
        setCurrentDrawing(null);
      }
    }
  };

  const calculateAngle = (p1: { x: number; y: number }, vertex: { x: number; y: number }, p2: { x: number; y: number }) => {
    const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
    const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
    let angle = Math.abs((angle1 - angle2) * (180 / Math.PI));
    if (angle > 180) angle = 360 - angle;
    return Math.round(angle);
  };

  const calculateDualMarkerDelta = () => {
    if (markers.length < 2) return null;
    const m1 = markers[markers.length - 2];
    const m2 = markers[markers.length - 1];
    
    const frameDelta = Math.abs(m2.frame - m1.frame);
    const timeDelta = (frameDelta / 30).toFixed(3); // Convert to seconds at 30fps
    
    const distance = Math.sqrt(
      Math.pow(m2.x - m1.x, 2) + Math.pow(m2.y - m1.y, 2)
    );
    
    return { frameDelta, timeDelta, distance: distance.toFixed(0) };
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ghost overlay if enabled
    if (showGhostOverlay && compareVideoRef.current) {
      ctx.globalAlpha = ghostOpacity;
      ctx.drawImage(compareVideoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }

    // Draw skeleton if enabled
    if (showSkeleton && skeletonData) {
      drawSkeleton(ctx, skeletonData);
    }

    // Draw all saved drawings
    const currentFrame = Math.floor(currentTime * 30);
    drawings.forEach(drawing => {
      // Only show drawings from current frame or persistent ones
      if (drawing.frame !== undefined && Math.abs(drawing.frame - currentFrame) > 5) return;

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
        drawAngle(ctx, drawing);
      }
    });

    // Draw markers
    markers.forEach(marker => {
      if (Math.abs(marker.frame - currentFrame) > 10) return;

      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(marker.label, marker.x + 12, marker.y + 5);
    });
  };

  const drawAngle = (ctx: CanvasRenderingContext2D, drawing: DrawingElement) => {
    const points = drawing.points;
    
    // Draw angle lines
    ctx.beginPath();
    ctx.moveTo(points[1].x, points[1].y);
    ctx.lineTo(points[0].x, points[0].y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.stroke();

    // Draw angle arc
    const radius = 50;
    const angle1 = Math.atan2(points[0].y - points[1].y, points[0].x - points[1].x);
    const angle2 = Math.atan2(points[2].y - points[1].y, points[2].x - points[1].x);
    
    ctx.beginPath();
    ctx.arc(points[1].x, points[1].y, radius, angle1, angle2);
    ctx.stroke();

    // Draw angle value with background
    if (drawing.angleValue) {
      const textX = points[1].x + 60;
      const textY = points[1].y - 20;
      const text = `${drawing.angleValue}°`;
      
      ctx.font = 'bold 20px Arial';
      const metrics = ctx.measureText(text);
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(textX - 5, textY - 18, metrics.width + 10, 24);
      
      // Text
      ctx.fillStyle = drawing.color;
      ctx.fillText(text, textX, textY);
    }
  };

  const drawSkeleton = (ctx: CanvasRenderingContext2D, skeleton: any) => {
    // Draw pose skeleton with color coding
    const connections = [
      { from: 'left_hip', to: 'left_shoulder', color: '#facc15' }, // Yellow for hips
      { from: 'right_hip', to: 'right_shoulder', color: '#facc15' },
      { from: 'left_shoulder', to: 'right_shoulder', color: '#3b82f6' }, // Blue for torso
      { from: 'left_shoulder', to: 'left_elbow', color: '#ef4444' }, // Red for arms
      { from: 'left_elbow', to: 'left_wrist', color: '#ef4444' },
      { from: 'right_shoulder', to: 'right_elbow', color: '#ef4444' },
      { from: 'right_elbow', to: 'right_wrist', color: '#ef4444' },
    ];

    ctx.lineWidth = 4;
    connections.forEach(conn => {
      if (skeleton[conn.from] && skeleton[conn.to]) {
        ctx.strokeStyle = conn.color;
        ctx.beginPath();
        ctx.moveTo(skeleton[conn.from].x, skeleton[conn.from].y);
        ctx.lineTo(skeleton[conn.to].x, skeleton[conn.to].y);
        ctx.stroke();
      }
    });

    // Draw joints
    Object.values(skeleton).forEach((joint: any) => {
      if (joint.x && joint.y) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(joint.x, joint.y, 5, 0, Math.PI * 2);
        ctx.fill();
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
    } else if (activeTool === 'line' && currentDrawing.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(currentDrawing[0].x, currentDrawing[0].y);
      ctx.lineTo(currentDrawing[1].x, currentDrawing[1].y);
      ctx.stroke();
    } else if (activeTool === 'angle' && currentDrawing.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(currentDrawing[0].x, currentDrawing[0].y);
      if (currentDrawing.length >= 2) {
        ctx.lineTo(currentDrawing[1].x, currentDrawing[1].y);
        if (currentDrawing.length === 3) {
          ctx.moveTo(currentDrawing[1].x, currentDrawing[1].y);
          ctx.lineTo(currentDrawing[2].x, currentDrawing[2].y);
        }
      }
      ctx.stroke();
    }
  };

  const handleUndo = () => {
    if (drawings.length > 0) {
      setDrawings(drawings.slice(0, -1));
      toast({ title: "Undo", description: "Last drawing removed" });
    } else if (markers.length > 0) {
      setMarkers(markers.slice(0, -1));
      toast({ title: "Undo", description: "Last marker removed" });
    }
  };

  const handleClear = () => {
    setDrawings([]);
    setMarkers([]);
    toast({ title: "Cleared", description: "All annotations removed" });
  };

  const handleSaveFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

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

  const applyTemplate = (template: string) => {
    setActiveTool('select');
    setTemplateMode(template as any);
    setTemplatePoints([]);
    
    const pointsNeeded = template === 'hip-shoulder' ? 3 : 2;
    toast({ 
      title: "Template Mode Active", 
      description: `Click ${pointsNeeded} points on the video for ${template.replace('-', ' ')} template` 
    });
  };

  const applyInteractiveTemplate = (template: string, points: { x: number; y: number }[]) => {
    const frameNum = Math.floor(currentTime * 30);

    switch (template) {
      case 'posture':
        setDrawings(prev => [...prev, {
          type: 'line',
          points: [points[0], points[1]],
          color: '#FFD700',
          frame: frameNum
        }]);
        toast({ title: "Posture Line Added", description: "Vertical spine reference" });
        break;
      case 'base':
        setDrawings(prev => [...prev, {
          type: 'line',
          points: [points[0], points[1]],
          color: '#FFD700',
          frame: frameNum
        }]);
        toast({ title: "Base Width Added", description: "Stance width reference" });
        break;
      case 'hip-shoulder':
        if (points.length === 3) {
          // Create angle from three points
          const angle = calculateAngle(points[0], points[1], points[2]);
          setDrawings(prev => [...prev, {
            type: 'angle',
            points: points,
            color: '#00FF00',
            angleValue: angle,
            frame: frameNum
          }]);
          toast({ title: "Hip-Shoulder Separation", description: `Angle: ${angle}°` });
        }
        break;
      case 'bat-plane':
        setDrawings(prev => [...prev, {
          type: 'line',
          points: [points[0], points[1]],
          color: '#FF6B6B',
          frame: frameNum
        }]);
        toast({ title: "Bat Plane Added", description: "Swing path reference" });
        break;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0').slice(0, 2)}`;
  };

  const dualMarkerDelta = calculateDualMarkerDelta();

  return (
    <Card className="overflow-hidden">
      <div className={cn("relative bg-black", splitView ? "grid grid-cols-2 gap-2" : "")}>
        {/* Main Video */}
        <div className="relative">
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
            className="absolute inset-0 w-full h-full"
            style={{ 
              pointerEvents: activeTool === 'select' && !templateMode ? 'none' : 'auto', 
              cursor: activeTool !== 'select' || templateMode ? 'crosshair' : 'default' 
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onClick={handleCanvasClick}
          />
          {!splitView && (
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              Current
            </div>
          )}
          {/* Template Helper */}
          {templateMode && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
              Template: Click {templateMode === 'hip-shoulder' ? '3' : '2'} points for {templateMode.replace('-', ' ')}
              {templatePoints.length > 0 && ` (${templatePoints.length} selected)`}
            </div>
          )}
        </div>

        {/* Compare Video */}
        {splitView && compareVideoUrl && (
          <div className="relative">
            <video
              ref={compareVideoRef}
              src={compareVideoUrl}
              className="w-full aspect-video"
            />
            <canvas
              ref={compareCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              Comparison
            </div>
          </div>
        )}
      </div>

      {/* Advanced Controls */}
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
          <Button
            size="sm"
            variant={activeTool === 'marker' ? 'default' : 'outline'}
            onClick={() => setActiveTool('marker')}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" />
            Marker
          </Button>

          {/* Templates Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Layers className="h-4 w-4" />
                Templates
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Telestration Templates</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => applyTemplate('posture')}>
                Posture Line
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate('base')}>
                Base Width
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate('hip-shoulder')}>
                Hip-Shoulder Separation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate('bat-plane')}>
                Bat Plane
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex-1" />
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleUndo}
            disabled={drawings.length === 0 && markers.length === 0}
            className="gap-2"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClear}
            disabled={drawings.length === 0 && markers.length === 0}
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
          </Button>
        </div>

        {/* Advanced Toggles */}
        <div className="flex items-center gap-4 flex-wrap">
          {showPoseOverlay && (
            <div className="flex items-center gap-2">
              <Switch
                id="skeleton-toggle"
                checked={showSkeleton}
                onCheckedChange={setShowSkeleton}
              />
              <Label htmlFor="skeleton-toggle" className="text-sm cursor-pointer">
                Show Skeleton
              </Label>
            </div>
          )}
          
          {compareVideoUrl && (
            <>
              <div className="flex items-center gap-2">
                <Switch
                  id="ghost-toggle"
                  checked={showGhostOverlay}
                  onCheckedChange={setShowGhostOverlay}
                />
                <Label htmlFor="ghost-toggle" className="text-sm cursor-pointer">
                  Ghost Overlay
                </Label>
              </div>
              
              {showGhostOverlay && (
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <Label className="text-xs whitespace-nowrap">Opacity:</Label>
                  <Slider
                    value={[ghostOpacity * 100]}
                    max={100}
                    step={5}
                    onValueChange={(v) => setGhostOpacity(v[0] / 100)}
                    className="flex-1"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  id="split-toggle"
                  checked={splitView}
                  onCheckedChange={setSplitView}
                />
                <Label htmlFor="split-toggle" className="text-sm cursor-pointer">
                  Side-by-Side
                </Label>
              </div>
            </>
          )}
        </div>

        {/* Dual Marker Delta Display */}
        {dualMarkerDelta && (
          <div className="bg-primary/10 p-3 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-semibold">Marker Analysis:</span>
              <span>Time: {dualMarkerDelta.timeDelta}s</span>
              <span>Frames: {dualMarkerDelta.frameDelta}</span>
              <span>Distance: {dualMarkerDelta.distance}px</span>
            </div>
          </div>
        )}

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
            
            <span className="text-sm text-muted-foreground px-2 font-mono">
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
