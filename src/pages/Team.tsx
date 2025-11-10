import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Team() {
  const [checkInStatus, setCheckInStatus] = useState<"pending" | "completed">("pending");
  const [roster, setRoster] = useState<any[]>([]);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    // TODO: Fetch actual team data
    setRoster([
      { id: 1, name: "John Smith", position: "OF", lastActive: "2 hours ago" },
      { id: 2, name: "Mike Johnson", position: "IF", lastActive: "1 day ago" }
    ]);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">Your team roster and weekly check-ins</p>
        </div>

        <Tabs defaultValue="roster">
          <TabsList>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="checkin">Weekly Check-In</TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Roster
                </CardTitle>
                <CardDescription>View your teammates and their activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roster.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.position}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Active {player.lastActive}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkin" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Weekly Check-In</CardTitle>
                    <CardDescription>Complete before Monday Zoom session</CardDescription>
                  </div>
                  {checkInStatus === "completed" ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-4 w-4 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {checkInStatus === "pending" ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Share your progress and goals for the upcoming week.
                    </p>
                    <Button className="w-full">Complete Check-In</Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You've completed this week's check-in. Great job!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
