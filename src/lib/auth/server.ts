import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  isAccountStatus,
  isPortalRole,
  type PortalIdentity,
  type PortalRole,
} from "./types";

type PortalUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  account_status: string | null;
  is_content_handler: boolean | null;
  banned_until: string | null;
  ban_reason: string | null;
};

export class AuthenticationError extends Error {
  readonly status = 401;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  readonly status = 403;

  constructor(message = "You are not authorized to access this resource") {
    super(message);
    this.name = "AuthorizationError";
  }
}

function isCurrentlyBanned(bannedUntil: string | null) {
  if (!bannedUntil) return false;
  return new Date(bannedUntil).getTime() > Date.now();
}

export async function getPortalIdentity(): Promise<PortalIdentity | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // getUser validates the Supabase access-token JWT with the Auth server.
  if (authError || !user) return null;

  const [portalResult, roleResult] = await Promise.all([
    supabase
      .from("portal_users")
      .select("id, name, email, role, account_status, is_content_handler, banned_until, ban_reason")
      .eq("id", user.id)
      .single(),
    supabase.from("user_roles").select("role_key").eq("user_id", user.id),
  ]);
  const { data, error } = portalResult;
  const { data: roleRows } = roleResult;

  if (error || !data) return null;

  const row = data as PortalUserRow;
  if (!isPortalRole(row.role)) return null;

  const roles = Array.from(
    new Set([
      row.role,
      ...(roleRows || [])
        .map((assignment) => assignment.role_key)
        .filter(isPortalRole),
    ]),
  );

  const { data: permissionRows } = roles.length
    ? await supabase
        .from("role_permissions")
        .select("permission_key")
        .in("role_key", roles)
    : { data: [] };
  const permissions = Array.from(
    new Set((permissionRows || []).map((item) => item.permission_key)),
  );
  const accountStatus = isAccountStatus(row.account_status)
    ? row.account_status
    : "pending";

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    roles,
    permissions,
    accountStatus,
    isContentHandler: Boolean(row.is_content_handler),
    emailVerified: Boolean(user.email_confirmed_at),
    bannedUntil: row.banned_until,
    banReason: row.ban_reason,
  };
}

export async function requirePortalIdentity(options?: {
  roles?: readonly PortalRole[];
  permissions?: readonly string[];
  allowPending?: boolean;
  requireContentHandler?: boolean;
}): Promise<PortalIdentity> {
  const identity = await getPortalIdentity();

  if (!identity) throw new AuthenticationError();
  if (!identity.emailVerified) {
    throw new AuthorizationError("Verify your institutional email before continuing");
  }
  if (isCurrentlyBanned(identity.bannedUntil)) {
    throw new AuthorizationError(
      identity.banReason
        ? `Account suspended: ${identity.banReason}`
        : "This account is suspended",
    );
  }
  if (!options?.allowPending && identity.accountStatus !== "active") {
    throw new AuthorizationError("This account is awaiting institutional approval");
  }
  if (options?.roles && !options.roles.some((role) => identity.roles.includes(role))) {
    throw new AuthorizationError();
  }
  if (options?.permissions && !options.permissions.every((permission) => identity.permissions.includes(permission))) {
    throw new AuthorizationError("A required permission is missing");
  }
  if (options?.requireContentHandler && !identity.isContentHandler) {
    throw new AuthorizationError("Content-handler permission is required");
  }

  return identity;
}

export async function requirePageIdentity(options?: {
  roles?: readonly PortalRole[];
  permissions?: readonly string[];
  requireContentHandler?: boolean;
}) {
  try {
    return await requirePortalIdentity(options);
  } catch (error) {
    if (error instanceof AuthenticationError) redirect("/login");
    if (error instanceof AuthorizationError) redirect("/unauthorized");
    throw error;
  }
}
