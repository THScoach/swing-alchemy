import { Home, Video, BookOpen, ShoppingBag, User, Users, Shield, TrendingUp, Calendar as CalendarIcon, Library, UsersRound, MessageSquare, Zap, Upload, Gift, DollarSign } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const playerNavItems = [
  { icon: Home, label: "Feed", path: "/feed" },
  { icon: Video, label: "Analyze", path: "/analyze" },
  { icon: BookOpen, label: "Courses", path: "/courses" },
  { icon: ShoppingBag, label: "Store", path: "/store" },
  { icon: TrendingUp, label: "My Progress", path: "/my-progress" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: Library, label: "Knowledge Base", path: "/knowledge-base" },
  { icon: UsersRound, label: "Team", path: "/team" },
  { icon: User, label: "Profile", path: "/profile" },
];

const adminNavItems = [
  { icon: Shield, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Players", path: "/admin/players" },
  { icon: UsersRound, label: "Teams", path: "/admin/teams" },
  { icon: MessageSquare, label: "Messaging", path: "/admin/messaging" },
  { icon: Zap, label: "Automations", path: "/admin/automations" },
  { icon: Upload, label: "Content", path: "/admin/content" },
  { icon: Library, label: "Notebook", path: "/admin/notebook" },
  { icon: Gift, label: "Gamification", path: "/admin/gamification" },
  { icon: DollarSign, label: "Subscriptions", path: "/admin/subscriptions" },
];

export const AppSidebar = () => {
  const location = useLocation();
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (data) {
          setRoles(data.map(r => r.role));
        }
      }
    };

    fetchRoles();
  }, []);

  const isAdmin = roles.includes('admin');
  const isCoach = roles.includes('coach') || isAdmin;

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 bg-secondary text-secondary-foreground border-r border-border h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <Link to="/feed" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">HS</span>
          </div>
          <span className="font-bold text-lg text-foreground">The Hitting Skool</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {/* Player Navigation */}
        <div className="px-3 mb-6">
          <ul className="space-y-1">
            {playerNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="px-3 border-t border-border/50 pt-4">
            <div className="text-xs font-semibold text-muted-foreground px-3 mb-2">ADMIN</div>
            <ul className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 The Hitting Skool
        </p>
      </div>
    </aside>
  );
};
