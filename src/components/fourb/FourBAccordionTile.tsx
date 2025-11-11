import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, User, Activity, Target, ChevronDown, TrendingUp, Info } from "lucide-react";
import { TileData } from "@/lib/fourb/types";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FourBAccordionTileProps {
  tile: TileData;
  data?: any;
  onAssignDrill?: () => void;
  onViewTrend?: () => void;
}

const icons = {
  brain: Brain,
  body: User,
  bat: Activity,
  ball: Target,
};

const stateColors = {
  'synced': 'from-success/10 to-success/5 border-success/20',
  'developing': 'from-warning/10 to-warning/5 border-warning/20',
  'limiting': 'from-destructive/10 to-destructive/5 border-destructive/20',
  'no-data': 'from-muted/10 to-muted/5 border-border',
};

const iconColors = {
  'synced': 'text-success',
  'developing': 'text-warning',
  'limiting': 'text-destructive',
  'no-data': 'text-muted-foreground',
};

const metricConfig = {
  brain: {
    metrics: [
      { key: 'processing_speed', label: 'Processing Speed', unit: '%', optimal: '70-100', tooltip: 'Speed at which you process visual information and make decisions.' },
      { key: 'tracking_focus', label: 'Tracking/Focus', unit: '%', optimal: '70-100', tooltip: 'Ability to track the ball and maintain focus during at-bats.' },
      { key: 'impulse_control', label: 'Impulse Control', unit: '%', optimal: '70-100', tooltip: 'Plate discipline and avoiding chasing bad pitches.' },
      { key: 'decision_making', label: 'Decision Making', unit: '%', optimal: '70-100', tooltip: 'Overall cognitive performance in game situations.' },
    ]
  },
  body: {
    metrics: [
      { key: 'com_forward_movement_pct', label: 'COM Movement', unit: '%', optimal: '20-30%', tooltip: 'Center of mass forward movement. Optimal 20-30% for balance.' },
      { key: 'spine_stability_score', label: 'Spine Stability', unit: '', optimal: '85+', tooltip: 'How stable your spine stays during the swing. Higher is better.' },
      { key: 'head_movement_inches', label: 'Head Movement', unit: '"', optimal: '< 3"', tooltip: 'Head movement from stance to contact. Less is better for tracking.' },
      { key: 'sequence_correct', label: 'Sequence', unit: '', optimal: 'Correct', tooltip: 'Kinematic sequence: hips → torso → arms. Proper energy transfer.' },
    ]
  },
  bat: {
    metrics: [
      { key: 'avg_bat_speed', label: 'Bat Speed', unit: ' mph', optimal: 'Level-dependent', tooltip: 'Average bat speed at contact. Higher bat speed = more exit velocity potential.' },
      { key: 'attack_angle_avg', label: 'Attack Angle', unit: '°', optimal: '8-15°', tooltip: 'Bat path angle at contact. Optimal 8-15° matches pitch plane.' },
      { key: 'time_in_zone_ms', label: 'Time in Zone', unit: 'ms', optimal: '> 50ms', tooltip: 'How long the bat stays in the hitting zone. More time = more margin for error.' },
      { key: 'bat_speed_sd', label: 'Consistency', unit: ' mph', optimal: '< 3 mph', tooltip: 'Bat speed standard deviation. Lower = more consistent swings.' },
    ]
  },
  ball: {
    metrics: [
      { key: 'ev90', label: 'EV90', unit: ' mph', optimal: 'Level-dependent', tooltip: 'Top 10% exit velocity. Key indicator of power potential.' },
      { key: 'la90', label: 'LA90', unit: '°', optimal: '15-30°', tooltip: 'Top 10% launch angle. Sweet spot is 15-30° for line drives and power.' },
      { key: 'barrel_like_rate', label: 'Barrel Rate', unit: '%', optimal: '> 40%', tooltip: 'Percentage of "barrel" hits (optimal EV + LA combo).' },
      { key: 'hard_hit_rate', label: 'Hard Hit %', unit: '%', optimal: '> 60%', tooltip: 'Percentage of batted balls with high exit velocity.' },
    ]
  },
};

export function FourBAccordionTile({ tile, data, onAssignDrill, onViewTrend }: FourBAccordionTileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = icons[tile.name];
  const bgGradient = stateColors[tile.state];
  const iconColor = iconColors[tile.state];
  const metrics = metricConfig[tile.name]?.metrics || [];

  const formatValue = (value: any, metric: any) => {
    if (value === undefined || value === null) return '—';
    if (metric.key === 'sequence_correct') {
      return value ? '✓ Correct' : '✗ Incorrect';
    }
    if (typeof value === 'number') {
      return `${value.toFixed(1)}${metric.unit}`;
    }
    return `${value}${metric.unit}`;
  };

  const getValueColor = (value: any, metric: any) => {
    if (value === undefined || value === null) return 'text-muted-foreground';
    
    // Simple heuristic: higher percentiles are better for brain, body
    if (tile.name === 'brain' && typeof value === 'number') {
      if (value >= 70) return 'text-success';
      if (value >= 50) return 'text-warning';
      return 'text-destructive';
    }
    
    // For body metrics, depends on the metric
    if (tile.name === 'body') {
      if (metric.key === 'com_forward_movement_pct') {
        if (value >= 20 && value <= 30) return 'text-success';
        if (value >= 15 && value <= 35) return 'text-warning';
        return 'text-destructive';
      }
      if (metric.key === 'spine_stability_score') {
        if (value >= 85) return 'text-success';
        if (value >= 75) return 'text-warning';
        return 'text-destructive';
      }
      if (metric.key === 'head_movement_inches') {
        if (value <= 3) return 'text-success';
        if (value <= 4.5) return 'text-warning';
        return 'text-destructive';
      }
      if (metric.key === 'sequence_correct') {
        return value ? 'text-success' : 'text-destructive';
      }
    }
    
    return 'text-foreground';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`bg-gradient-to-br ${bgGradient} border transition-all`}>
        <CollapsibleTrigger className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className={`h-6 w-6 ${iconColor}`} />
                <div className="text-left">
                  <div className="font-semibold capitalize text-lg">{tile.title}</div>
                  <div className={`text-sm font-medium ${iconColor}`}>
                    {tile.state === 'no-data' ? 'No Data' : tile.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {tile.score !== undefined && (
                  <span className="text-3xl font-bold">{Math.round(tile.score)}</span>
                )}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
            {tile.score !== undefined && (
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    tile.state === 'synced' ? 'bg-success' :
                    tile.state === 'developing' ? 'bg-warning' :
                    'bg-destructive'
                  }`}
                  style={{ width: `${Math.min(tile.score, 100)}%` }}
                />
              </div>
            )}
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((metric) => {
                const value = data?.[metric.key];
                return (
                  <TooltipProvider key={metric.key}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-3 border rounded-lg bg-background/50 hover:bg-background/70 transition-colors cursor-help">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <span>{metric.label}</span>
                            <Info className="h-3 w-3" />
                          </div>
                          <div className={`text-xl font-bold ${getValueColor(value, metric)}`}>
                            {formatValue(value, metric)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Optimal: {metric.optimal}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-sm">{metric.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>

            {/* Coach Rick Summary */}
            {data && (
              <div className="p-3 border rounded-lg bg-primary/5">
                <div className="flex items-start gap-2">
                  <Brain className="h-4 w-4 text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-primary mb-1">Coach Rick AI</div>
                    <p className="text-sm text-muted-foreground">
                      {tile.name === 'brain' && 'Strong cognitive foundation. Keep working on decision speed during live ABs.'}
                      {tile.name === 'body' && 'Good movement efficiency. Focus on maintaining spine angle through contact.'}
                      {tile.name === 'bat' && 'Solid bat path. Work on consistency to reduce swing variation.'}
                      {tile.name === 'ball' && 'Great contact quality. Keep launch angle in the 15-30° sweet spot.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={onViewTrend}>
                <TrendingUp className="h-3 w-3 mr-1" />
                View Trend
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={onAssignDrill}>
                <Target className="h-3 w-3 mr-1" />
                Assign Drill
              </Button>
            </div>

            {!data && (
              <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                Upload data to see detailed {tile.name} metrics and insights.
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
