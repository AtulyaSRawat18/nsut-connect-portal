import type { ReactNode } from "react";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const identity = await requirePageIdentity({ roles: ["admin"], permissions: ["user.read", "report.read", "faculty.verify"] });
  const supabase = await createClient();
  const [pendingUsers, reports, verifications] = await Promise.all([
    supabase.from("portal_users").select("id", { count: "exact", head: true }).eq("account_status", "pending"),
    supabase.from("content_reports").select("id", { count: "exact", head: true }).in("status", ["open", "reviewing"]),
    supabase.from("faculty_verification_requests").select("id", { count: "exact", head: true }).in("status", ["pending", "reviewing"]),
  ]);

  return <WorkspaceShell title="NSUT Administration" roleLabel="Institutional control desk" user={{ name: identity.name, email: identity.email }} navigation={[
    { label: "Overview", href: "/admin", icon: "dashboard" },
    { label: "Users", href: "/admin/users", icon: "users", badge: pendingUsers.count || 0 },
    { label: "Reports", href: "/admin/reports", icon: "reports", badge: reports.count || 0 },
    { label: "Faculty verification", href: "/admin/faculty-verification", icon: "verification", badge: verifications.count || 0 },
  ]}>{children}</WorkspaceShell>;
}
