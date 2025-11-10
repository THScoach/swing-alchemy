import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, CreditCard, TrendingUp, Activity, DollarSign, BookOpen } from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalAnalyses: 0,
    mrr: 0,
    churnRate: 0,
    growthRate: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
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
    setLoading(false);
  };

  const fetchStats = async () => {
    // Fetch total users
    const { count: userCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Fetch total analyses
    const { count: analysisCount } = await supabase
      .from("video_analyses")
      .select("*", { count: "exact", head: true });

    setStats({
      totalUsers: userCount || 0,
      totalTeams: 0,
      totalAnalyses: analysisCount || 0,
      mrr: 0,
      churnRate: 0,
      growthRate: 0,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Total Teams", value: stats.totalTeams, icon: Building2, color: "text-green-500" },
    { label: "Total Analyses", value: stats.totalAnalyses, icon: Activity, color: "text-purple-500" },
    { label: "MRR", value: `$${stats.mrr.toLocaleString()}`, icon: DollarSign, color: "text-yellow-500" },
    { label: "Churn Rate", value: `${stats.churnRate}%`, icon: TrendingUp, color: "text-red-500" },
    { label: "Growth Rate", value: `${stats.growthRate}%`, icon: TrendingUp, color: "text-green-500" },
  ];

  const quickActions = [
    { label: "View All Users", path: "/admin/players" },
    { label: "View All Teams", path: "/admin/teams" },
    { label: "Coach Rick's Notebook", path: "/admin/notebook" },
    { label: "Manage Subscriptions", path: "/admin/subscriptions" },
  ];

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, teams, and platform analytics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`h-12 w-12 ${stat.color}`} />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-20"
                  onClick={() => navigate(action.path)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
