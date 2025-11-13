import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Move } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface COMGraphProps {
  comData: any;
  currentTime?: number;
  duration?: number;
  syncEnabled?: boolean;
  onTimeClick?: (time: number) => void;
  onToggleCOMTrace?: (enabled: boolean) => void;
  comTraceEnabled?: boolean;
}

export function COMGraph({ 
  comData, 
  currentTime = 0, 
  duration = 1,
  syncEnabled = false,
  onTimeClick,
  onToggleCOMTrace,
  comTraceEnabled = false
}: COMGraphProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Generate chart data from COM data
  const generateChartData = () => {
    if (!comData || !Array.isArray(comData)) {
      // Generate sample data if no real data
      const points = 100;
      return Array.from({ length: points }, (_, i) => ({
        time: i / points,
        comX: Math.sin(i / 10) * 0.2 + 0.5,
        comY: Math.cos(i / 10) * 0.15 + 0.5,
      }));
    }

    return comData.map((point: any, index: number) => ({
      time: index / (comData.length - 1),
      comX: point.x || 0,
      comY: point.y || 0,
    }));
  };

  const chartData = generateChartData();
  const normalizedTime = duration > 0 ? currentTime / duration : 0;

  // Calculate metrics
  const startX = chartData[0]?.comX || 0;
  const endX = chartData[chartData.length - 1]?.comX || 0;
  const forwardMovement = ((endX - startX) * 100).toFixed(1);
  
  const maxX = Math.max(...chartData.map(d => d.comX));
  const minX = Math.min(...chartData.map(d => d.comX));
  const maxY = Math.max(...chartData.map(d => d.comY));
  const minY = Math.min(...chartData.map(d => d.comY));
  const totalTravel = Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2));

  const handleChartClick = (data: any) => {
    if (onTimeClick && data?.activePayload?.[0]?.payload?.time !== undefined) {
      const clickedTime = data.activePayload[0].payload.time;
      onTimeClick(clickedTime * duration);
    }
  };

  return (
    <>
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Move className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Center of Mass Movement</CardTitle>
                <CardDescription>Tracks your COM forward/back and up/down</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => onToggleCOMTrace?.(!comTraceEnabled)} 
                variant={comTraceEnabled ? "default" : "outline"}
                size="sm"
              >
                {comTraceEnabled ? 'Hide' : 'Show'} COM Trace
              </Button>
              <Button onClick={() => setDetailsOpen(true)} variant="outline" size="sm">
                Open COM View
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-3 bg-card">
                <div className="text-sm text-muted-foreground mb-1">Forward Movement</div>
                <div className="text-2xl font-bold text-athlete-red">{forwardMovement}%</div>
              </div>
              <div className="rounded-lg border p-3 bg-card">
                <div className="text-sm text-muted-foreground mb-1">Total Travel</div>
                <div className="text-2xl font-bold text-athlete-red">{(totalTravel * 100).toFixed(1)}%</div>
              </div>
              <div className="rounded-lg border p-3 bg-card">
                <div className="text-sm text-muted-foreground mb-1">Stability</div>
                <Badge variant={totalTravel < 0.3 ? "default" : "secondary"}>
                  {totalTravel < 0.3 ? 'Good' : 'Review'}
                </Badge>
              </div>
            </div>

            {/* Chart */}
            <div className="h-[250px] w-full" onClick={handleChartClick}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--foreground))"
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <YAxis 
                    stroke="hsl(var(--foreground))"
                    label={{ value: 'Position', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="comX" stroke="hsl(var(--athlete-red))" strokeWidth={2} name="COM-X (Forward/Back)" dot={false} />
                  <Line type="monotone" dataKey="comY" stroke="hsl(var(--brand-gold))" strokeWidth={2} name="COM-Y (Up/Down)" dot={false} />
                  
                  {/* Timeline cursor */}
                  {syncEnabled && (
                    <ReferenceLine 
                      x={normalizedTime} 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Coach Rick Explanation */}
            <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-primary">
              <p className="text-sm font-medium mb-2">Coach Rick Says:</p>
              <p className="text-sm text-muted-foreground">
                {parseFloat(forwardMovement) > 5 
                  ? "Great forward momentum! You're transferring your weight into the ball effectively."
                  : parseFloat(forwardMovement) < -5
                  ? "You're drifting backward. Try to stay more centered and drive forward through contact."
                  : "Your weight transfer is minimal. Work on loading back and then exploding forward."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Center of Mass Analysis</DialogTitle>
            <DialogDescription>
              Detailed view of your body's center of mass movement during the swing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Combined X/Y Plot */}
            <div>
              <h3 className="text-lg font-semibold mb-3">COM Movement Path</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--foreground))"
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      label={{ value: 'Time in Swing', position: 'insideBottom', fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--foreground))"
                      label={{ value: 'Position', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="comX" stroke="hsl(var(--athlete-red))" strokeWidth={3} name="Forward/Back (COM-X)" dot={false} />
                    <Line type="monotone" dataKey="comY" stroke="hsl(var(--brand-gold))" strokeWidth={3} name="Up/Down (COM-Y)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Interpretation */}
            <div>
              <h3 className="text-lg font-semibold mb-3">What This Means</h3>
              <div className="space-y-3">
                <div className="rounded-lg border p-4 bg-muted/20">
                  <h4 className="font-semibold mb-2 text-athlete-red">Forward/Back Movement (COM-X)</h4>
                  <p className="text-sm text-muted-foreground">
                    This shows how much you move toward the pitcher (positive) or away from the pitcher (negative). 
                    Elite hitters typically show a small forward drift (5-10%) during load, then drive forward through contact.
                  </p>
                </div>
                <div className="rounded-lg border p-4 bg-muted/20">
                  <h4 className="font-semibold mb-2 text-brand-gold">Up/Down Movement (COM-Y)</h4>
                  <p className="text-sm text-muted-foreground">
                    This shows your vertical movement. A slight drop during load (negative) followed by a rise during launch is common. 
                    Excessive up/down movement can indicate poor posture or balance issues.
                  </p>
                </div>
              </div>
            </div>

            {/* Coach Rick Deep Dive */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Coach Rick's Deep Dive</h3>
              <div className="rounded-lg border p-4 bg-muted/20">
                <p className="text-sm text-muted-foreground mb-3">
                  Your center of mass is like the "control tower" of your swing. It tells us where your body weight is going and how stable you are.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                  <li>Stable COM = consistent contact and power</li>
                  <li>Forward drift = good weight transfer and aggressive approach</li>
                  <li>Backward drift = defensive swing, loss of power</li>
                  <li>Excessive vertical = timing issues or poor posture</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
