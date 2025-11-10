import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Gift, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminGamification() {
  const leaderboard = [
    { rank: 1, player: "John Smith", points: 2450, level: "Silver" },
    { rank: 2, player: "Mike Johnson", points: 2100, level: "Bronze" },
    { rank: 3, player: "Sarah Williams", points: 1850, level: "Bronze" }
  ];

  const rewards = [
    { id: 1, name: "Custom Bat Wrap", cost: 500, redeemed: 23 },
    { id: 2, name: "1-on-1 Session", cost: 2000, redeemed: 8 },
    { id: 3, name: "THS Gear Pack", cost: 1000, redeemed: 15 }
  ];

  const pointRules = [
    { action: "Upload Swing", points: 50 },
    { action: "Complete Weekly Check-In", points: 100 },
    { action: "7-Day Streak", points: 250 },
    { action: "Course Completion", points: 500 }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gamification</h1>
          <p className="text-muted-foreground">Manage points, rewards, and leaderboards</p>
        </div>

        <Tabs defaultValue="leaderboard">
          <TabsList>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="points">Point Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Top Players
                </CardTitle>
                <CardDescription>Current rankings based on THS Points</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry) => (
                      <TableRow key={entry.rank}>
                        <TableCell className="font-medium">#{entry.rank}</TableCell>
                        <TableCell>{entry.player}</TableCell>
                        <TableCell>{entry.points}</TableCell>
                        <TableCell>
                          <Badge>{entry.level}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="flex justify-end">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Reward
              </Button>
            </div>
            <div className="grid gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Gift className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle>{reward.name}</CardTitle>
                          <CardDescription>
                            {reward.cost} points • {reward.redeemed} redeemed
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="points" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Point Rules</CardTitle>
                    <CardDescription>Configure how players earn THS Points</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Points Awarded</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pointRules.map((rule, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{rule.action}</TableCell>
                        <TableCell className="font-medium">+{rule.points}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
