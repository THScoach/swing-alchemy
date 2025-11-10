import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface KineticSequenceChartProps {
  data?: any;
}

export const KineticSequenceChart = ({ data: kineticData }: KineticSequenceChartProps) => {
  if (!kineticData || !kineticData.data || kineticData.data.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Kinetic sequence data is not yet available for this analysis. This data will be populated once video processing is complete.
        </AlertDescription>
      </Alert>
    );
  }

  const data = kineticData.data;

  return (
    <div className="space-y-6">
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5 }}
              className="text-xs"
            />
            <YAxis 
              label={{ value: 'Angular Velocity (deg/s)', angle: -90, position: 'insideLeft' }}
              className="text-xs"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            
            {/* Swing phase markers */}
            <ReferenceLine x="0.20" stroke="hsl(var(--warning))" strokeDasharray="3 3" label="Load" />
            <ReferenceLine x="0.35" stroke="hsl(var(--success))" strokeDasharray="3 3" label="Launch" />
            <ReferenceLine x="0.60" stroke="hsl(var(--destructive))" strokeDasharray="3 3" label="Contact" />
            <ReferenceLine x="0.80" stroke="hsl(var(--primary))" strokeDasharray="3 3" label="Extension" />
            
            <Line 
              type="monotone" 
              dataKey="pelvis" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              dot={false}
              name="Pelvis"
            />
            <Line 
              type="monotone" 
              dataKey="torso" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              dot={false}
              name="Torso"
            />
            <Line 
              type="monotone" 
              dataKey="arms" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
              name="Arms"
            />
            <Line 
              type="monotone" 
              dataKey="bat" 
              stroke="hsl(var(--warning))" 
              strokeWidth={2}
              dot={false}
              name="Bat"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {kineticData.score && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Sequence Score: {kineticData.score}/10</CardTitle>
            <CardDescription>
              <span className={`inline-flex items-center gap-1 font-medium ${
                kineticData.score >= 8 ? 'text-success' : 
                kineticData.score >= 6 ? 'text-warning' : 
                'text-destructive'
              }`}>
                ● {kineticData.score >= 8 ? 'Optimal' : kineticData.score >= 6 ? 'Good' : 'Needs Work'}
              </span>
            </CardDescription>
          </CardHeader>
          {kineticData.analysis && (
            <CardContent className="text-sm text-muted-foreground">
              <p>{kineticData.analysis}</p>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};
