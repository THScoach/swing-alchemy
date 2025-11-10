import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  Bell, 
  LogOut, 
  Edit, 
  Bluetooth,
  Video,
  BookOpen,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const stats = [
    { label: "Analyses", value: 24, icon: Video },
    { label: "Courses", value: 2, icon: BookOpen },
    { label: "Training Days", value: 18, icon: Calendar },
  ];

  return (
    <Layout>
      <div className="p-4 space-y-4">
        {/* Profile Header */}
        <Card className="border-none shadow-none bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">John Doe</h2>
                <p className="text-muted-foreground mb-2">Baseball • Right Handed</p>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Pro Member
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-4 text-center">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Player Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Player Info</CardTitle>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sport</span>
              <span className="font-medium">Baseball</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Position</span>
              <span className="font-medium">Outfield</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bats</span>
              <span className="font-medium">Right</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Height</span>
              <span className="font-medium">6'1"</span>
            </div>
          </CardContent>
        </Card>

        {/* Pocket Radar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-lg">Pocket Radar</CardTitle>
              <CardDescription className="mt-1">Last synced 2 hours ago</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              <Bluetooth className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Sync Device
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <Settings className="mr-3 h-5 w-5" />
              App Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="lg">
              <Bell className="mr-3 h-5 w-5" />
              Notifications
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" 
              size="lg"
              onClick={() => navigate("/auth")}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
