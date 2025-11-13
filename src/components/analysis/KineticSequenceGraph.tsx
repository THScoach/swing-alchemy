import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity } from "lucide-react";
import { KineticSequenceScore } from "@/lib/analysis/kineticSequenceScoring";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSeverityColor } from "@/lib/analysis/types";

interface KineticSequenceGraphProps {
  sequenceScore: KineticSequenceScore;
  currentTime?: number;
  duration?: number;
  syncEnabled?: boolean;
  onTimeClick?: (time: number) => void;
}

export function KineticSequenceGraph({ 
  sequenceScore, 
  currentTime = 0, 
  duration = 1,
  syncEnabled = false,
  onTimeClick
}: KineticSequenceGraphProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Generate normalized chart data (0-1 for time)
  const generateChartData = () => {
    const points = 100;
    const data = [];
    
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      
      // Simulate angular velocity curves with peaks at different times
      // These would come from actual kinematics data in production
      const pelvisVel = Math.sin((t - 0.2) * Math.PI * 4) * Math.exp(-(Math.pow(t - 0.3, 2)) * 10);
      const torsoVel = Math.sin((t - 0.25) * Math.PI * 4) * Math.exp(-(Math.pow(t - 0.4, 2)) * 10);
      const armVel = Math.sin((t - 0.3) * Math.PI * 4) * Math.exp(-(Math.pow(t - 0.5, 2)) * 10);
      const handsVel = Math.sin((t - 0.35) * Math.PI * 4) * Math.exp(-(Math.pow(t - 0.6, 2)) * 10);
      
      data.push({
        time: t,
        pelvis: Math.max(0, pelvisVel * 100),
        torso: Math.max(0, torsoVel * 100),
        leadArm: Math.max(0, armVel * 100),
        hands: Math.max(0, handsVel * 100),
      });
    }
    
    return data;
  };

  const chartData = generateChartData();
  const normalizedTime = duration > 0 ? currentTime / duration : 0;

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
              <Activity className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Kinematic Sequence Timing</CardTitle>
                <CardDescription>Shows pelvis → torso → arm → hands firing order</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-bold ${getSeverityColor(sequenceScore.severity)}`}>
                {sequenceScore.overall}
              </div>
              <Button onClick={() => setDetailsOpen(true)} variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Coach Rick Explanation */}
            <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-primary">
              <p className="text-sm font-medium mb-2">Coach Rick Says:</p>
              <p className="text-sm text-muted-foreground">{sequenceScore.coachRickSummary}</p>
            </div>

            {/* Chart */}
            <div className="h-[300px] w-full" onClick={handleChartClick}>
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
                    label={{ value: 'Angular Velocity', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="pelvis" stroke="hsl(var(--athlete-red))" strokeWidth={2} name="Pelvis" dot={false} />
                  <Line type="monotone" dataKey="torso" stroke="hsl(var(--success))" strokeWidth={2} name="Torso" dot={false} />
                  <Line type="monotone" dataKey="leadArm" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Lead Arm" dot={false} />
                  <Line type="monotone" dataKey="hands" stroke="hsl(var(--brand-gold))" strokeWidth={2} name="Hands" dot={false} />
                  
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
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kinematic Sequence Details</DialogTitle>
            <DialogDescription>
              Detailed breakdown of your kinematic chain timing and efficiency
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Peak Timing Table */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Peak Timing</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead>Peak Velocity</TableHead>
                    <TableHead>Peak Time (ms)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sequenceScore.peaks.map((segment) => (
                  <TableRow key={segment.segment}>
                      <TableCell className="font-medium">{segment.segment}</TableCell>
                      <TableCell>{segment.peakVelocity?.toFixed(1) || 'N/A'} deg/s</TableCell>
                      <TableCell>{((segment.peakTime || 0) * 1000).toFixed(0) || 'N/A'} ms</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {segment.grade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Acceleration/Deceleration Pattern */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Acceleration/Deceleration Pattern</h3>
              <div className="rounded-lg border p-4 bg-muted/20">
                <p className="text-sm text-muted-foreground mb-2">
                  {sequenceScore.accelDecelPattern.message}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Score:</span>
                  <Badge>{sequenceScore.accelDecelPattern.score}</Badge>
                </div>
              </div>
            </div>

            {/* Technical Explanation */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Technical Explanation</h3>
              <div className="rounded-lg border p-4 bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  The kinematic sequence represents how energy transfers through your body during the swing. 
                  Elite hitters show a proximal-to-distal pattern: hips peak first, then torso, then arms, then hands. 
                  This allows each segment to accelerate the next, creating a "whip effect" that maximizes bat speed 
                  while minimizing effort. Proper deceleration (distal-to-proximal) helps protect joints and maintain control.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
