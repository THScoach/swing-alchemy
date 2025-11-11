import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Play, Pause, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function AdminAutomations() {
  const navigate = useNavigate();
  const automations = [
    {
      id: 1,
      name: "Sunday Check-In Reminder",
      trigger: "Every Sunday 6:00 PM",
      action: "Send SMS + Email reminder",
      active: true,
      runs: 48
    },
    {
      id: 2,
      name: "New User Onboarding",
      trigger: "User signup",
      action: "Send welcome sequence",
      active: true,
      runs: 23
    },
    {
      id: 3,
      name: "Inactivity Alert",
      trigger: "No upload for 7 days",
      action: "Send engagement message",
      active: false,
      runs: 12
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/admin")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Automations</h1>
            <p className="text-muted-foreground">Trigger-based workflows and notifications</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>

        <div className="grid gap-4">
          {automations.map((automation) => (
            <Card key={automation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{automation.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Trigger: {automation.trigger} → {automation.action}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      {automation.runs} runs
                    </div>
                    <Switch checked={automation.active} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit Workflow
                  </Button>
                  <Button variant="outline" size="sm">
                    View Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
