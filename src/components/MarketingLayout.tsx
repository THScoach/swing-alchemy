import { MarketingNav } from "./MarketingNav";
import { MarketingFooter } from "./MarketingFooter";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
};
