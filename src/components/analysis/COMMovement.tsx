import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Move, Eye, EyeOff } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSeverityColor, getSeverityBorderColor, getSeverity } from "@/lib/analysis/types";
import { useState } from "react";

interface COMMovementProps {
  comData: any;
  onToggleCOMTrace?: (enabled: boolean) => void;
  comTraceEnabled?: boolean;
}

export function COMMovement({ comData, onToggleCOMTrace, comTraceEnabled = false }: COMMovementProps) {
  const [showTrace, setShowTrace] = useState(comTraceEnabled);
  
  // Extract COM data
  const comForwardPct = comData?.com_forward_movement_pct || 0;
  const comXData = comData?.com_x_trace || [];
  const comYData = comData?.com_y_trace || [];
  
  // Create graph data
  const graphData = comXData.map((x: number, i: number) => ({
    frame: i,
    comX: x,
    comY: comYData[i] || 0,
  }));
  
  // Score COM movement (optimal is 20-30%)
  let comScore = 100;
  if (comForwardPct < 10 || comForwardPct > 40) comScore = 40;
  else if (comForwardPct < 15 || comForwardPct > 35) comScore = 60;
  else if (comForwardPct < 18 || comForwardPct > 32) comScore = 80;
  else comScore = 95;
  
  const severity = getSeverity(comScore);
  
  const handleToggleTrace = (checked: boolean) => {
    setShowTrace(checked);
    onToggleCOMTrace?.(checked);
  };
  
  return (
    <Card className={`border-2 ${getSeverityBorderColor(severity)}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Move className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Center of Mass Movement</CardTitle>
              <CardDescription>Balance and weight transfer</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="com-trace"
                checked={showTrace}
                onCheckedChange={handleToggleTrace}
              />
              <Label htmlFor="com-trace" className="text-sm cursor-pointer flex items-center gap-1">
                {showTrace ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Show on Video
              </Label>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getSeverityColor(severity)}`}>
                {comScore}
              </div>
              <div className="text-sm text-muted-foreground">/ 100</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Coach Rick Explanation */}
        <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-primary">
          <p className="text-sm font-medium mb-2">Coach Rick Says:</p>
          <p className="text-sm text-muted-foreground">
            {comScore >= 80
              ? "Perfect weight transfer! Your center of mass moves forward just the right amount, giving you balance and power."
              : comScore >= 60
              ? "Your weight shift is okay but could be better. Try to feel your body moving slightly forward as you load, about 20-25% of your stance width."
              : "Your weight transfer needs work. You're either hanging back too much or lunging forward. Work on controlled, smooth forward movement as you swing."}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border-2 p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-1">Forward Movement</div>
            <div className="text-2xl font-bold">{comForwardPct.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">Optimal: 20-30%</div>
          </div>
          
          <div className="rounded-lg border-2 p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-1">Total Travel</div>
            <div className="text-2xl font-bold">
              {Math.sqrt(
                Math.pow((comXData[comXData.length - 1] || 0) - (comXData[0] || 0), 2) +
                Math.pow((comYData[comYData.length - 1] || 0) - (comYData[0] || 0), 2)
              ).toFixed(1)}"
            </div>
            <div className="text-xs text-muted-foreground mt-1">Path length</div>
          </div>
        </div>

        {/* COM Path Graph */}
        {graphData.length > 0 && (
          <div className="rounded-lg border p-4 bg-muted/20">
            <h4 className="font-semibold mb-3 text-sm">COM Path Trace</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="frame" 
                  label={{ value: 'Frame', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'Position (inches)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="comX" 
                  stroke="hsl(var(--primary))" 
                  name="COM-X (Forward/Back)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="comY" 
                  stroke="hsl(var(--chart-2))" 
                  name="COM-Y (Vertical)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              Tap graph points to scrub video to that frame (coming soon)
            </p>
          </div>
        )}

        {/* Technical Explanation */}
        <div className="rounded-lg border p-4 bg-muted/20">
          <h4 className="font-semibold mb-2 text-sm">Technical Details</h4>
          <p className="text-xs text-muted-foreground">
            Your center of mass (COM) is the balance point of your entire body. Elite hitters move their COM 
            forward about 20-30% during the swing - enough to generate power but not so much that they lose balance. 
            The path should be smooth and controlled, not jerky or excessive.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
