import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SwingScore } from "@/lib/analysis/types";
import { KineticSequenceScore } from "@/lib/analysis/kineticSequenceScoring";
import { getSeverityColor, getSeverityBorderColor } from "@/lib/analysis/types";

interface AdvancedDetailsAccordionProps {
  swingScore: SwingScore;
  kineticScore?: KineticSequenceScore | null;
}

export function AdvancedDetailsAccordion({ swingScore, kineticScore }: AdvancedDetailsAccordionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Advanced Details</h2>
      
      <Accordion type="multiple" className="w-full">
        {/* Anchor Sub-Metrics */}
        <AccordionItem value="anchor">
          <AccordionTrigger className="text-lg font-semibold">
            Anchor Sub-Metrics
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {swingScore.anchor.subMetrics.map((metric, idx) => (
                <div 
                  key={idx}
                  className={`rounded-lg border-2 ${getSeverityBorderColor(metric.severity)} p-4`}
                >
                  <div className="flex justify-between items-start mb-2">
                  <div>
                      <h4 className="font-semibold">{metric.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{metric.description}</p>
                    </div>
                    <Badge className={getSeverityColor(metric.severity)}>
                      {metric.score.toFixed(0)}
                    </Badge>
                  </div>
                  {metric.coachRickTip && (
                    <div className="mt-2 p-3 rounded bg-muted/50 border-l-4 border-primary">
                      <p className="text-sm font-medium mb-1">Coach Rick Says:</p>
                      <p className="text-sm text-muted-foreground">{metric.coachRickTip}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Stability Sub-Metrics */}
        <AccordionItem value="stability">
          <AccordionTrigger className="text-lg font-semibold">
            Stability Sub-Metrics
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {swingScore.stability.subMetrics.map((metric, idx) => (
                <div 
                  key={idx}
                  className={`rounded-lg border-2 ${getSeverityBorderColor(metric.severity)} p-4`}
                >
                  <div className="flex justify-between items-start mb-2">
                  <div>
                      <h4 className="font-semibold">{metric.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{metric.description}</p>
                    </div>
                    <Badge className={getSeverityColor(metric.severity)}>
                      {metric.score.toFixed(0)}
                    </Badge>
                  </div>
                  {metric.coachRickTip && (
                    <div className="mt-2 p-3 rounded bg-muted/50 border-l-4 border-primary">
                      <p className="text-sm font-medium mb-1">Coach Rick Says:</p>
                      <p className="text-sm text-muted-foreground">{metric.coachRickTip}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Whip Sub-Metrics */}
        <AccordionItem value="whip">
          <AccordionTrigger className="text-lg font-semibold">
            Whip Sub-Metrics
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {swingScore.whip.subMetrics.map((metric, idx) => (
                <div 
                  key={idx}
                  className={`rounded-lg border-2 ${getSeverityBorderColor(metric.severity)} p-4`}
                >
                  <div className="flex justify-between items-start mb-2">
                  <div>
                      <h4 className="font-semibold">{metric.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{metric.description}</p>
                    </div>
                    <Badge className={getSeverityColor(metric.severity)}>
                      {metric.score.toFixed(0)}
                    </Badge>
                  </div>
                  {metric.coachRickTip && (
                    <div className="mt-2 p-3 rounded bg-muted/50 border-l-4 border-primary">
                      <p className="text-sm font-medium mb-1">Coach Rick Says:</p>
                      <p className="text-sm text-muted-foreground">{metric.coachRickTip}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Biomechanical Calculations */}
        {kineticScore && (
          <AccordionItem value="biomechanics">
            <AccordionTrigger className="text-lg font-semibold">
              Biomechanical Calculations
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="font-semibold mb-3">Joint Angles & Velocities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {kineticScore.peaks.map((segment, idx) => (
                      <div key={idx} className="rounded-lg border p-3 bg-muted/20">
                        <div className="font-medium mb-1">{segment.segment}</div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Peak Velocity: {segment.peakVelocity?.toFixed(1) || 'N/A'} deg/s</div>
                          <div>Peak Time: {((segment.peakTime || 0) * 1000).toFixed(0) || 'N/A'} ms</div>
                          <div>Grade: {segment.grade}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">MLB Standard Ranges</h4>
                  <div className="rounded-lg border p-4 bg-muted/20">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Pelvis Peak Velocity: 600-800 deg/s</li>
                      <li>• Torso Peak Velocity: 900-1200 deg/s</li>
                      <li>• Lead Arm Peak Velocity: 1000-1400 deg/s</li>
                      <li>• Hands Peak Velocity: 1200-1600 deg/s</li>
                      <li>• Peak Spacing: 30-50ms between segments</li>
                      <li>• Total Sequence Duration: 150-200ms</li>
                    </ul>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </Card>
  );
}
