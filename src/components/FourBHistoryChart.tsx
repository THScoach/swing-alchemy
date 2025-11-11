import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, TrendingUp } from "lucide-react";

interface FourBHistoryChartProps {
  data: Array<{
    date: string;
    brain_score?: number | null;
    body_score?: number | null;
    bat_score?: number | null;
    ball_score?: number | null;
    overall_score?: number | null;
  }>;
  onUploadClick?: () => void;
}

export function FourBHistoryChart({ data, onUploadClick }: FourBHistoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>4B Metrics History</CardTitle>
          <CardDescription>Track your Brain, Body, Bat, and Ball scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <TrendingUp className="h-12 w-12 text-muted-foreground opacity-50" />
            <div>
              <p className="text-muted-foreground mb-2">No 4B history yet.</p>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your first swing to start tracking progress.
              </p>
            </div>
            {onUploadClick && (
              <Button onClick={onUploadClick} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Swing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Overall: item.overall_score ? Math.round(item.overall_score) : null,
    Brain: item.brain_score ? Math.round(item.brain_score) : null,
    Body: item.body_score ? Math.round(item.body_score) : null,
    Bat: item.bat_score ? Math.round(item.bat_score) : null,
    Ball: item.ball_score ? Math.round(item.ball_score) : null,
  })).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>4B Metrics History</CardTitle>
        <CardDescription>
          {data.length} {data.length === 1 ? 'analysis' : 'analyses'} recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              domain={[0, 100]}
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Overall" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
            <Line 
              type="monotone" 
              dataKey="Brain" 
              stroke="hsl(280, 70%, 60%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(280, 70%, 60%)' }}
            />
            <Line 
              type="monotone" 
              dataKey="Body" 
              stroke="hsl(210, 70%, 60%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(210, 70%, 60%)' }}
            />
            <Line 
              type="monotone" 
              dataKey="Bat" 
              stroke="hsl(45, 90%, 60%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(45, 90%, 60%)' }}
            />
            <Line 
              type="monotone" 
              dataKey="Ball" 
              stroke="hsl(140, 60%, 50%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(140, 60%, 50%)' }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Recent Analyses Summary */}
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold">Recent Analyses</h4>
          {data.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm">
              <span className="text-muted-foreground">
                {new Date(item.date).toLocaleDateString()}
              </span>
              <div className="flex gap-3">
                <span className="font-medium">Overall: {item.overall_score ? Math.round(item.overall_score) : '-'}</span>
                <span className="text-muted-foreground">|</span>
                <span>B: {item.brain_score ? Math.round(item.brain_score) : '-'}</span>
                <span>Bo: {item.body_score ? Math.round(item.body_score) : '-'}</span>
                <span>Ba: {item.bat_score ? Math.round(item.bat_score) : '-'}</span>
                <span>Bl: {item.ball_score ? Math.round(item.ball_score) : '-'}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
