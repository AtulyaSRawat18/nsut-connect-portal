export const PORTAL_ROLES = ["student", "faculty", "moderator", "admin"] as const;
export type PortalRole = (typeof PORTAL_ROLES)[number];

export const ACCOUNT_STATUSES = ["pending", "active", "suspended"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export interface PortalIdentity {
  id: string;
  email: string;
  name: string;
  role: PortalRole;
  roles: PortalRole[];
  permissions: string[];
  accountStatus: AccountStatus;
  isContentHandler: boolean;
  emailVerified: boolean;
  bannedUntil: string | null;
  banReason: string | null;
}

export function isPortalRole(value: unknown): value is PortalRole {
  return typeof value === "string" && PORTAL_ROLES.includes(value as PortalRole);
}

export function isAccountStatus(value: unknown): value is AccountStatus {
  return (
    typeof value === "string" &&
    ACCOUNT_STATUSES.includes(value as AccountStatus)
  );
}
