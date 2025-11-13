import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KineticSequenceScore } from "@/lib/analysis/kineticSequenceScoring";
import { getSeverityColor, getSeverityBorderColor } from "@/lib/analysis/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Activity } from "lucide-react";
import { useState } from "react";

interface KineticSequencePanelProps {
  sequenceScore: KineticSequenceScore;
}

export function KineticSequencePanel({ sequenceScore }: KineticSequencePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const gradeColors: Record<string, string> = {
    'A': 'bg-green-500',
    'B': 'bg-green-400',
    'C': 'bg-yellow-500',
    'D': 'bg-orange-500',
    'F': 'bg-red-500',
  };
  
  const segmentLabels: Record<string, string> = {
    'pelvis': 'Pelvis (Hips)',
    'torso': 'Torso (Chest)',
    'leadArm': 'Lead Arm',
    'hands': 'Hands',
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <CardTitle>Kinematic Sequence</CardTitle>
                  <CardDescription>
                    How well your body passes speed from hips → torso → arm → hands
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getSeverityColor(sequenceScore.severity)}`}>
                    {sequenceScore.overall}
                  </div>
                  <div className="text-sm text-muted-foreground">/ 100</div>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Coach Rick Summary */}
            <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-primary">
              <p className="text-sm font-medium mb-2">Coach Rick Says:</p>
              <p className="text-sm text-muted-foreground">{sequenceScore.coachRickSummary}</p>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`rounded-lg border-2 ${getSeverityBorderColor(sequenceScore.peakOrder.severity)} p-3`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium">Peak Order</span>
                  <Badge variant={sequenceScore.peakOrder.inCorrectOrder ? "default" : "destructive"}>
                    {sequenceScore.peakOrder.score}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{sequenceScore.peakOrder.message}</p>
              </div>

              <div className={`rounded-lg border-2 ${getSeverityBorderColor(sequenceScore.peakSpacing.severity)} p-3`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium">Peak Spacing</span>
                  <Badge variant="outline">{sequenceScore.peakSpacing.score}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{sequenceScore.peakSpacing.message}</p>
              </div>

              <div className={`rounded-lg border-2 ${getSeverityBorderColor(sequenceScore.accelDecelPattern.severity)} p-3`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium">Accel-Decel Pattern</span>
                  <Badge variant="outline">{sequenceScore.accelDecelPattern.score}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{sequenceScore.accelDecelPattern.message}</p>
              </div>

              <div className={`rounded-lg border-2 ${getSeverityBorderColor(sequenceScore.energyTransfer.severity)} p-3`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium">Energy Transfer</span>
                  <Badge variant="outline">{sequenceScore.energyTransfer.score}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{sequenceScore.energyTransfer.message}</p>
              </div>
            </div>

            {/* Sequence Graph */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Angular Velocity Over Time</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={sequenceScore.graphData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="time" 
                      label={{ value: 'Normalized Time (0-1)', position: 'insideBottom', offset: -5 }}
                      className="text-xs"
                      domain={[0, 1]}
                      tickFormatter={(value) => value.toFixed(2)}
                    />
                    <YAxis 
                      label={{ value: 'Angular Velocity', angle: -90, position: 'insideLeft' }}
                      className="text-xs"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => value.toFixed(1)}
                    />
                    <Legend />
                    
                    <Line 
                      type="monotone" 
                      dataKey="pelvis" 
                      stroke="#ef4444" 
                      strokeWidth={2.5}
                      dot={false}
                      name="Pelvis"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="torso" 
                      stroke="#22c55e" 
                      strokeWidth={2.5}
                      dot={false}
                      name="Torso"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="leadArm" 
                      stroke="#3b82f6" 
                      strokeWidth={2.5}
                      dot={false}
                      name="Lead Arm"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hands" 
                      stroke="#f59e0b" 
                      strokeWidth={2.5}
                      dot={false}
                      name="Hands"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {sequenceScore.peakOrder.inCorrectOrder ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  Clean succession of peaks – good energy transfer
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  {sequenceScore.peakOrder.message}
                </div>
              )}
            </div>

            {/* Deceleration Table */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Deceleration Analysis</h4>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Segment</TableHead>
                      <TableHead className="text-center">Peak Time</TableHead>
                      <TableHead className="text-center">Decel Start</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead>Coach Rick Says</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sequenceScore.peaks.map((peak) => (
                      <TableRow key={peak.segment}>
                        <TableCell className="font-medium">
                          {segmentLabels[peak.segment]}
                        </TableCell>
                        <TableCell className="text-center">
                          {peak.peakTime.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-center">
                          {peak.decelStartTime.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${gradeColors[peak.grade]} text-white`}>
                            {peak.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {peak.coachRickSays}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
