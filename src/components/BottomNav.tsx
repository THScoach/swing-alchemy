import { Home, Video, TrendingUp, Library, User, Shield, Users, MessageSquare, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const playerNavItems = [
  { icon: Home, label: "Feed", path: "/feed" },
  { icon: Video, label: "Analyze", path: "/analyze" },
  { icon: TrendingUp, label: "Progress", path: "/my-progress" },
  { icon: Library, label: "KB", path: "/knowledge-base" },
  { icon: User, label: "Profile", path: "/profile" },
];

const adminNavItems = [
  { icon: Shield, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Players", path: "/admin/players" },
  { icon: MessageSquare, label: "Messages", path: "/admin/messaging" },
  { icon: BookOpen, label: "Content", path: "/admin/content" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const BottomNav = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        setIsAdmin(!!data);
      }
    };
    checkAdmin();
  }, []);

  // Show admin nav when on admin routes AND user is admin
  const navItems = (isAdminRoute && isAdmin) ? adminNavItems : playerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 lg:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
