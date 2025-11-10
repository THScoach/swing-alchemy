export type OrgRole = "admin" | "coach" | "player" | "viewer";

export type SubscriptionTier = "team" | "enterprise";

export interface Organization {
  id: string;
  name: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

export const FEATURE_GATES = {
  gamePlanGenerator: ["enterprise"],
  advancedAnalytics: ["enterprise"],
  customReports: ["enterprise"],
  bulkExport: ["enterprise"],
  auditLogs: ["enterprise"],
} as const;

export function hasAccess(
  tier: SubscriptionTier,
  feature: keyof typeof FEATURE_GATES
): boolean {
  return (FEATURE_GATES[feature] as readonly SubscriptionTier[]).includes(tier);
}
