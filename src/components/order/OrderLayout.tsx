import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";

interface OrderLayoutProps {
  children: ReactNode;
}

export const OrderLayout = ({ children }: OrderLayoutProps) => {
  return (
    <MarketingLayout>
      <div className="bg-background min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_400px] gap-8 items-start">
            {children}
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
};
