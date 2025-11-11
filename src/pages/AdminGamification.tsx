import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Gift, ArrowLeft } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

export default function AdminGamification() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: hasAdminRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!hasAdminRole) {
      navigate("/feed");
      return;
    }

    setIsAdmin(true);
    await fetchLeaderboard();
    setLoading(false);
  };

  const fetchLeaderboard = async () => {
    try {
      const { data } = await supabase
        .from('player_points')
        .select(`
          *,
          players!inner(name)
        `)
        .order('balance', { ascending: false })
        .limit(10);
      
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const pointRules = [
    { action: "Upload Swing", points: 50 },
    { action: "Complete Weekly Check-In", points: 100 },
    { action: "7-Day Streak", points: 250 },
    { action: "Course Completion", points: 500 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

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
                      <TableHead>Streak</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No players yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      leaderboard.map((player, index) => (
                        <TableRow key={player.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{player.players?.name || 'Unknown'}</TableCell>
                          <TableCell>{player.balance}</TableCell>
                          <TableCell>
                            <Badge>{player.level}</Badge>
                          </TableCell>
                          <TableCell>{player.streak} days</TableCell>
                        </TableRow>
                      ))
                    )}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Rewards Catalog
                </CardTitle>
                <CardDescription>Configure rewards that players can redeem</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No rewards configured yet</p>
              </CardContent>
            </Card>
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
