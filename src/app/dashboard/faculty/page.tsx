import Link from "next/link";
import { BookOpen, ClipboardList, FolderKanban, Users } from "lucide-react";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import WorkspaceStatCard from "@/components/workspace/WorkspaceStatCard";

export default async function FacultyWorkspaceOverview() {
  const identity = await requirePageIdentity({ permissions: ["project.create"] });
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, department, status, max_students, created_at")
    .eq("faculty_id", identity.id)
    .order("created_at", { ascending: false });
  const projectIds = (projects || []).map((project) => project.id);
  const [pending, accepted, publications] = await Promise.all([
    projectIds.length
      ? supabase.from("applications").select("id", { count: "exact", head: true }).in("project_id", projectIds).eq("status", "pending")
      : Promise.resolve({ count: 0 }),
    projectIds.length
      ? supabase.from("applications").select("id", { count: "exact", head: true }).in("project_id", projectIds).eq("status", "accepted")
      : Promise.resolve({ count: 0 }),
    supabase.from("publications").select("id", { count: "exact", head: true }).eq("faculty_id", identity.id),
  ]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Faculty research desk</p>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Welcome, {identity.name}</h1>
          <p className="mt-3 max-w-2xl text-foreground/55">Manage research opportunities, review student interest, and maintain your academic record.</p>
        </div>
        <Link href="/dashboard/faculty/projects/new" className="rounded-xl bg-primary px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-primary-foreground">
          Create project
        </Link>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard label="Research projects" value={(projects || []).length} detail="Owned" icon={<FolderKanban className="h-5 w-5" />} />
        <WorkspaceStatCard label="Pending applications" value={pending.count || 0} detail="Review" icon={<ClipboardList className="h-5 w-5" />} />
        <WorkspaceStatCard label="Accepted students" value={accepted.count || 0} detail="Active" icon={<Users className="h-5 w-5" />} />
        <WorkspaceStatCard label="Publications" value={publications.count || 0} detail="Profile" icon={<BookOpen className="h-5 w-5" />} />
      </section>

      <section className="rounded-2xl border border-outline bg-surface p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div><h2 className="text-xl font-black text-foreground">Recent projects</h2><p className="text-sm text-foreground/50">Your latest research listings.</p></div>
          <Link href="/dashboard/faculty/projects" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Manage all</Link>
        </div>
        <div className="divide-y divide-outline">
          {(projects || []).slice(0, 6).map((project) => (
            <div key={project.id} className="grid gap-3 py-5 md:grid-cols-[1fr_7rem_7rem_6rem] md:items-center">
              <div><p className="font-bold text-foreground">{project.title}</p><p className="mt-1 text-xs text-foreground/45">Created {new Date(project.created_at).toLocaleDateString()}</p></div>
              <span className="text-xs font-semibold text-foreground/55">{project.department}</span>
              <span className="text-xs text-foreground/55">{project.max_students} seats</span>
              <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase ${project.status === "open" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>{project.status}</span>
            </div>
          ))}
          {(projects || []).length === 0 && <p className="py-12 text-center text-sm text-foreground/45">Create your first research project to begin receiving applications.</p>}
        </div>
      </section>
    </div>
  );
}
