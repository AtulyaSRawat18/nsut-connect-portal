import Link from "next/link";
import { Filter, Pencil, Plus, Search } from "lucide-react";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import { ToggleProjectStatus } from "@/components/dashboard/ToggleProjectStatus";

import ProjectAssessment from "@/components/dashboard/ProjectAssessment";
import { DEPARTMENTS, getDepartmentCompactLabel, getDepartmentLabel, isDepartmentId } from "@/lib/departments";
const statuses = ["all", "open", "closed"] as const;

export default async function FacultyProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; department?: string }>;
}) {
  const identity = await requirePageIdentity({ permissions: ["project.update.own"] });
  const params = await searchParams;
  const q = (params?.q || "").trim().toLowerCase();
  const status = statuses.includes(params?.status as (typeof statuses)[number]) ? params?.status || "all" : "all";

  const supabase = await createClient();
  const currentProjects = await supabase
    .from("projects")
    .select("id, title, description, department, status, created_at, max_students, available_seats, brief_url, application_form_url, progress_percent, health_status, progress_note, last_assessed_at")
    .eq("faculty_id", identity.id)
    .order("created_at", { ascending: false });

  let data = currentProjects.data;
  let error = currentProjects.error;
  if (error && error.message.includes("application_form_url")) {
    const legacyProjects = await supabase
      .from("projects")
      .select("id, title, description, department, status, created_at, max_students, available_seats, brief_url, progress_percent, health_status, progress_note, last_assessed_at")
      .eq("faculty_id", identity.id)
      .order("created_at", { ascending: false });
    data = legacyProjects.data?.map((project) => ({ ...project, application_form_url: "NA" })) || null;
    error = legacyProjects.error;
  }

  const allProjects = data || [];
  const department = isDepartmentId(params?.department) ? params.department : "all";
  const projects = allProjects.filter((project) => {
    const matchesQuery = !q || project.title.toLowerCase().includes(q) || project.description.toLowerCase().includes(q);
    return matchesQuery && (status === "all" || project.status === status) && (department === "all" || project.department === department);
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Research management</p><h1 className="text-4xl font-black text-foreground">My projects</h1><p className="mt-3 text-foreground/55">Control visibility, evidence, student intake and peer collaboration workflows.</p></div>
        <Link href="/dashboard/faculty/projects/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground"><Plus className="h-4 w-4" /> New project</Link>
      </header>

      <form className="grid gap-3 rounded-2xl border border-outline bg-surface p-4 md:grid-cols-[1fr_11rem_11rem_auto]">
        <label className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-foreground/40" /><input name="q" defaultValue={params?.q || ""} placeholder="Search projects" className="w-full rounded-lg border border-outline bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary" /></label>
        <select name="status" defaultValue={status} aria-label="Filter projects by status" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary">
          <option value="all">All statuses</option><option value="open">Open</option><option value="closed">Closed</option>
        </select>
        <select name="department" defaultValue={department} aria-label="Filter projects by department" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary">
          <option value="all">All departments</option>{DEPARTMENTS.map((item) => <option key={item.id} value={item.id}>{getDepartmentLabel(item.id)}</option>)}
        </select>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest text-background"><Filter className="h-4 w-4" /> Filter</button>
      </form>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-12 text-center text-red-600">Projects are temporarily unavailable.</div>
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="rounded-2xl border border-outline bg-surface p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{getDepartmentCompactLabel(project.department)}</p><h2 className="text-xl font-black text-foreground">{project.title}</h2></div>
                <ToggleProjectStatus projectId={project.id} initialStatus={project.status} />
              </div>
              <p className="line-clamp-3 text-sm leading-relaxed text-foreground/60">{project.description}</p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-outline pt-4 text-xs text-foreground/45"><span>{project.status === "open" ? "Receiving student intake and collaboration requests" : "Requests closed"} · {project.available_seats}/{project.max_students} seats available</span><Link href={`/dashboard/faculty/projects/${project.id}/edit`} className="inline-flex items-center gap-2 rounded border border-outline px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:border-primary"><Pencil className="h-3.5 w-3.5" /> Edit all fields</Link></div>
              <ProjectAssessment projectId={project.id} briefUrl={project.brief_url} applicationFormUrl={project.application_form_url || "NA"} initialProgress={project.progress_percent || 0} initialHealth={project.health_status || "on_track"} initialNote={project.progress_note} />
            </article>
          ))}
          {projects.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-outline p-16 text-center text-foreground/45">No projects match these filters.</div>}
        </section>
      )}
    </div>
  );
}
