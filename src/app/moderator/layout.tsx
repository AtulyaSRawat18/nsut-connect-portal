import type { ReactNode } from "react";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default async function ModeratorLayout({ children }: { children: ReactNode }) {
  const identity = await requirePageIdentity({
    roles: ["moderator", "admin"],
    permissions: ["report.read"],
  });
  const supabase = await createClient();
  const [reports, verifications] = await Promise.all([
    supabase
      .from("content_reports")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "reviewing"]),
    supabase
      .from("faculty_verification_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "reviewing"]),
  ]);

  return (
    <WorkspaceShell
      title="NSUT Trust Desk"
      roleLabel="Moderator workspace"
      user={{ name: identity.name, email: identity.email }}
      navigation={[
        { label: "Overview", href: "/moderator", icon: "dashboard" },
        {
          label: "Content reports",
          href: "/moderator/reports",
          icon: "reports",
          badge: reports.count || 0,
        },
        {
          label: "Faculty verification",
          href: "/moderator/faculty-verification",
          icon: "verification",
          badge: verifications.count || 0,
        },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
