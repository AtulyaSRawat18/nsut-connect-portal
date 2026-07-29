import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import { ToggleProjectStatus } from "@/components/dashboard/ToggleProjectStatus";

export default async function FacultyProjectsPage() {
  const identity = await requirePageIdentity({ permissions: ["project.update.own"] });
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, description, department, status, max_students, created_at")
    .eq("faculty_id", identity.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Research management</p><h1 className="text-4xl font-black text-foreground">My projects</h1><p className="mt-3 text-foreground/55">Control visibility, capacity, and student intake.</p></div>
        <Link href="/dashboard/faculty/projects/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground"><Plus className="h-4 w-4" /> New project</Link>
      </header>

      <section className="grid gap-5 xl:grid-cols-2">
        {(projects || []).map((project) => (
          <article key={project.id} className="rounded-2xl border border-outline bg-surface p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{project.department}</p><h2 className="text-xl font-black text-foreground">{project.title}</h2></div>
              <ToggleProjectStatus projectId={project.id} initialStatus={project.status} />
            </div>
            <p className="line-clamp-3 text-sm leading-relaxed text-foreground/60">{project.description}</p>
            <div className="mt-6 flex items-center justify-between border-t border-outline pt-4 text-xs text-foreground/45">
              <span>{project.max_students} student seats</span><span>{new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          </article>
        ))}
        {(projects || []).length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-outline p-16 text-center text-foreground/45">No research projects yet.</div>}
      </section>
    </div>
  );
}
