import type { ReactNode } from "react";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default async function FacultyDashboardLayout({ children }: { children: ReactNode }) {
  const identity = await requirePageIdentity({
    roles: ["faculty", "admin"],
    permissions: ["project.create"],
  });
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("faculty_id", identity.id);
  const projectIds = (projects || []).map((project) => project.id);
  const pendingApplications = projectIds.length
    ? await supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .in("project_id", projectIds)
        .eq("status", "pending")
    : { count: 0 };

  return (
    <WorkspaceShell
      title="NSUT Faculty"
      roleLabel="Research workspace"
      user={{ name: identity.name, email: identity.email }}
      navigation={[
        { label: "Overview", href: "/dashboard/faculty", icon: "dashboard" },
        { label: "Research projects", href: "/dashboard/faculty/projects", icon: "projects" },
        {
          label: "Applications",
          href: "/dashboard/faculty/applications",
          icon: "applications",
          badge: pendingApplications.count || 0,
        },
        { label: "Publications", href: "/dashboard/faculty/publications", icon: "publications" },
        { label: "Publish news", href: "/dashboard/faculty/news/new", icon: "news" },
        { label: "Public profile", href: `/profile/${identity.id}`, icon: "profile" },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
