import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface ModelRebootMetricsPanelProps {
  metricsReboot: {
    fps_confirmed?: number;
    com_pct?: number;
    com_score?: number;
    head_movement_inches?: number;
    head_score?: number;
    spine_std?: number;
    spine_score?: number;
    sequence?: {
      pelvis_frame?: number;
      torso_frame?: number;
      arm_frame?: number;
      bat_frame?: number;
      score?: number;
      details?: string;
    };
    bat?: {
      speed?: number;
      speed_score?: number;
      attack_angle?: number;
      attack_angle_score?: number;
      time_in_zone_ms?: number;
      time_in_zone_score?: number;
    };
    ball?: {
      ev90?: number;
      ev90_score?: number;
      la90?: number;
      la90_score?: number;
      hard_hit_rate?: number;
      barrel_rate?: number;
    };
    weirdness?: {
      flags?: any;
      message?: string;
      has_any?: boolean;
    };
  };
  level?: string;
  handedness?: string;
}

export const ModelRebootMetricsPanel = ({ 
  metricsReboot, 
  level, 
  handedness 
}: ModelRebootMetricsPanelProps) => {
  if (!metricsReboot) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 80) return "text-blue-600 dark:text-blue-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const MetricRow = ({ label, value, score, unit = "" }: { 
    label: string; 
    value: number | undefined; 
    score: number | undefined;
    unit?: string;
  }) => {
    if (value === undefined || score === undefined) return null;
    
    return (
      <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-3">
          <span className="font-medium">
            {typeof value === 'number' ? value.toFixed(1) : value}{unit}
          </span>
          <Badge variant="outline" className={getScoreColor(score)}>
            {score.toFixed(0)}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Model / Reboot Metrics</CardTitle>
          <div className="flex gap-2">
            {level && <Badge variant="secondary">{level}</Badge>}
            {handedness && <Badge variant="outline">{handedness === 'L' ? 'Left' : 'Right'} Handed</Badge>}
          </div>
        </div>
        {metricsReboot.fps_confirmed && (
          <p className="text-sm text-muted-foreground">
            FPS Confirmed: <strong>{metricsReboot.fps_confirmed}</strong>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weirdness Alert */}
        {metricsReboot.weirdness?.has_any && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Tracking quality issues:</strong> {metricsReboot.weirdness.message}
              <br />
              <span className="text-xs">Use visuals for coaching only; retest recommended.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Body Metrics */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            Body
          </h3>
          <div className="space-y-1">
            <MetricRow 
              label="COM Forward" 
              value={metricsReboot.com_pct} 
              score={metricsReboot.com_score}
              unit="%" 
            />
            <MetricRow 
              label="Head Movement" 
              value={metricsReboot.head_movement_inches} 
              score={metricsReboot.head_score}
              unit='"' 
            />
            <MetricRow 
              label="Spine Stability" 
              value={metricsReboot.spine_std} 
              score={metricsReboot.spine_score}
              unit="° SD" 
            />
            {metricsReboot.sequence && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Kinematic Sequence</span>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">
                    {metricsReboot.sequence.details || 'N/A'}
                  </span>
                  {metricsReboot.sequence.score !== undefined && metricsReboot.sequence.score >= 90 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Badge variant="outline" className={getScoreColor(metricsReboot.sequence.score || 0)}>
                      {metricsReboot.sequence.score?.toFixed(0) || 0}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bat Metrics */}
        {metricsReboot.bat && (
          <div>
            <h3 className="font-semibold mb-3">Bat</h3>
            <div className="space-y-1">
              <MetricRow 
                label="Bat Speed (avg)" 
                value={metricsReboot.bat.speed} 
                score={metricsReboot.bat.speed_score}
                unit=" mph" 
              />
              <MetricRow 
                label="Attack Angle" 
                value={metricsReboot.bat.attack_angle} 
                score={metricsReboot.bat.attack_angle_score}
                unit="°" 
              />
              <MetricRow 
                label="Time in Zone" 
                value={metricsReboot.bat.time_in_zone_ms} 
                score={metricsReboot.bat.time_in_zone_score}
                unit=" ms" 
              />
            </div>
          </div>
        )}

        {/* Ball Metrics */}
        {metricsReboot.ball && (
          <div>
            <h3 className="font-semibold mb-3">Ball</h3>
            <div className="space-y-1">
              <MetricRow 
                label="EV90" 
                value={metricsReboot.ball.ev90} 
                score={metricsReboot.ball.ev90_score}
                unit=" mph" 
              />
              <MetricRow 
                label="LA90" 
                value={metricsReboot.ball.la90} 
                score={metricsReboot.ball.la90_score}
                unit="°" 
              />
              {metricsReboot.ball.barrel_rate !== undefined && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Barrel-like Rate</span>
                  <span className="font-medium">{metricsReboot.ball.barrel_rate.toFixed(1)}%</span>
                </div>
              )}
              {metricsReboot.ball.hard_hit_rate !== undefined && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Hard-hit Rate</span>
                  <span className="font-medium">{metricsReboot.ball.hard_hit_rate.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Quality Status */}
        {!metricsReboot.weirdness?.has_any && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              No tracking issues detected
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
