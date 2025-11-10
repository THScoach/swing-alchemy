import { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionTier, hasAccess, FEATURE_GATES } from "@/lib/security/types";

interface FeatureGateProps {
  feature: keyof typeof FEATURE_GATES;
  currentTier: SubscriptionTier;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, currentTier, children, fallback }: FeatureGateProps) {
  const allowed = hasAccess(currentTier, feature);

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Alert className="border-primary/20">
      <Lock className="h-4 w-4" />
      <AlertTitle>Enterprise Feature</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>This feature requires an Enterprise subscription.</p>
        <Button variant="outline" size="sm">
          Upgrade to Enterprise
        </Button>
      </AlertDescription>
    </Alert>
  );
}
