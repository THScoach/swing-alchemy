import { AppSidebar } from "./AppSidebar";
import { AppTopBar } from "./AppTopBar";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <AppSidebar />
      
      {/* Top Bar */}
      <AppTopBar />
      
      {/* Main Content */}
      <main className="lg:pl-60 pt-16 pb-20 lg:pb-4">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
};
