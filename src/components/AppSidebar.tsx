import { Home, Video, BookOpen, ShoppingBag, User, Users, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { icon: Home, label: "Feed", path: "/feed" },
  { icon: Video, label: "Analyze", path: "/analyze" },
  { icon: BookOpen, label: "Courses", path: "/courses" },
  { icon: ShoppingBag, label: "Store", path: "/store" },
  { icon: User, label: "Profile", path: "/profile" },
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

  const conditionalNavItems = [
    ...navItems,
    ...(roles.includes('coach') || roles.includes('admin') 
      ? [{ icon: Users, label: "Team", path: "/team" }] 
      : []),
    ...(roles.includes('admin') 
      ? [{ icon: Shield, label: "Admin", path: "/admin" }] 
      : []),
  ];

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
        <ul className="space-y-1 px-3">
          {conditionalNavItems.map((item) => {
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
