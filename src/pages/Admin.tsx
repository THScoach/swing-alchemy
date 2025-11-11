import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Building2, 
  MessageSquare, 
  Zap, 
  FileText, 
  BookOpen, 
  Trophy, 
  CreditCard,
  Calendar,
  Video,
  DollarSign
} from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

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

    // Load admin profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    setProfile(profileData);
    setIsAdmin(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const adminSections = [
    {
      title: "Players",
      description: "Manage player profiles, assignments, and progress",
      icon: Users,
      path: "/admin/players",
      color: "text-blue-500"
    },
    {
      title: "Teams",
      description: "Organize teams, rosters, and group training",
      icon: Building2,
      path: "/admin/teams",
      color: "text-green-500"
    },
    {
      title: "Teams Overview",
      description: "View 4B trends across all teams",
      icon: Building2,
      path: "/admin/teams-overview",
      color: "text-emerald-500"
    },
    {
      title: "Pro Swing Library",
      description: "Manage reference swings for comparison",
      icon: Video,
      path: "/admin/pro-swings",
      color: "text-purple-500"
    },
    {
      title: "Messaging",
      description: "Send announcements and communicate with players",
      icon: MessageSquare,
      path: "/admin/messaging",
      color: "text-pink-500"
    },
    {
      title: "Automations",
      description: "Set up automated workflows and notifications",
      icon: Zap,
      path: "/admin/automations",
      color: "text-yellow-500"
    },
    {
      title: "Content",
      description: "Manage training content, drills, and resources",
      icon: FileText,
      path: "/admin/content",
      color: "text-orange-500"
    },
    {
      title: "Coach's Notebook",
      description: "Personal notes, observations, and player insights",
      icon: BookOpen,
      path: "/admin/notebook",
      color: "text-indigo-500"
    },
    {
      title: "Gamification",
      description: "Configure points, levels, and player rewards",
      icon: Trophy,
      path: "/admin/gamification",
      color: "text-primary"
    },
    {
      title: "Subscriptions",
      description: "Manage billing plans and subscription tiers",
      icon: CreditCard,
      path: "/admin/subscriptions",
      color: "text-pink-500"
    },
    {
      title: "Bookings",
      description: "View and manage session bookings",
      icon: Calendar,
      path: "/admin/bookings",
      color: "text-cyan-500"
    },
    {
      title: "Transactions",
      description: "View payments and revenue analytics",
      icon: DollarSign,
      path: "/admin/transactions",
      color: "text-emerald-600"
    }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Control Panel</h1>
            <p className="text-muted-foreground text-lg">
              Manage all aspects of The Hitting Skool platform
            </p>
          </div>
          {profile && (
            <p className="text-sm text-muted-foreground hidden md:block">
              Welcome back, {profile.name?.split(' ')[0] || 'Coach'}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card 
                key={section.title}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(section.path)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-accent group-hover:bg-accent/80 transition-colors`}>
                      <Icon className={`h-6 w-6 ${section.color}`} />
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
