import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send, Users, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AdminMessaging() {
  const navigate = useNavigate();
  const campaigns = [
    {
      id: 1,
      name: "Weekly Check-In Reminder",
      type: "automated",
      channel: "SMS + Email",
      status: "active",
      sent: 145
    },
    {
      id: 2,
      name: "New Course Announcement",
      type: "manual",
      channel: "In-App",
      status: "draft",
      sent: 0
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
            <h1 className="text-3xl font-bold">Messaging</h1>
            <p className="text-muted-foreground">Communicate with players via SMS, Email, and In-App</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>

        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{campaign.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {campaign.channel} • Sent to {campaign.sent} recipients
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="outline">{campaign.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">View Stats</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="compose" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Message</CardTitle>
                <CardDescription>
                  Send targeted messages using smart tags like {`{{firstName}}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Message composer coming soon with segmentation filters and template variables.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
