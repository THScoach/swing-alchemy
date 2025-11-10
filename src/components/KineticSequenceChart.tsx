import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for kinetic sequence - in production this would come from video analysis
const generateKineticData = () => {
  const data = [];
  for (let i = 0; i <= 100; i++) {
    const time = i / 100; // 0 to 1 seconds
    
    // Pelvis peaks first (around 0.3s)
    const pelvis = Math.max(0, 1200 * Math.exp(-Math.pow((time - 0.3) / 0.08, 2)));
    
    // Torso peaks second (around 0.4s)
    const torso = Math.max(0, 1400 * Math.exp(-Math.pow((time - 0.4) / 0.08, 2)));
    
    // Arms peak third (around 0.5s)
    const arms = Math.max(0, 1600 * Math.exp(-Math.pow((time - 0.5) / 0.08, 2)));
    
    // Bat peaks last (around 0.6s)
    const bat = Math.max(0, 1800 * Math.exp(-Math.pow((time - 0.6) / 0.08, 2)));
    
    data.push({
      time: time.toFixed(2),
      pelvis: Math.round(pelvis),
      torso: Math.round(torso),
      arms: Math.round(arms),
      bat: Math.round(bat),
    });
  }
  return data;
};

export const KineticSequenceChart = () => {
  const data = generateKineticData();

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

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Sequence Score: 8.5/10</CardTitle>
          <CardDescription>
            <span className="inline-flex items-center gap-1 text-success font-medium">
              ● Optimal
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Your kinetic sequence shows excellent timing. The pelvis initiates rotation first, 
            followed by torso, arms, and finally the bat. This sequential pattern maximizes 
            power transfer and bat speed at contact.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
