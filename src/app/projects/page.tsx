import Link from "next/link";
import { ArrowRight, Filter, Search } from "lucide-react";
import Pagination from "@/components/shared/Pagination";
import { getPublicProjects } from "@/lib/public-data";

const departments = ["all", "CSE", "ECE", "IT", "MAC", "ICE", "MECH", "CIVIL", "BT", "BBA"] as const;
const statuses = ["all", "open", "closed"] as const;

export default async function Projects({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; department?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = (params?.q || "").trim();
  const department = departments.includes(params?.department as (typeof departments)[number]) ? params?.department || "all" : "all";
  const status = statuses.includes(params?.status as (typeof statuses)[number]) ? params?.status || "all" : "all";
  const result = await getPublicProjects({ q, department, status, page: Number(params?.page || 1) });
  const projects = result.data;

  return (
    <div className="min-h-screen bg-background py-16 font-sans">
      <div className="mx-auto max-w-7xl px-6">
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-primary md:text-6xl">Project Listings</h1>
        <p className="mb-12 max-w-2xl text-lg font-medium leading-relaxed text-foreground/65">Discover ongoing research initiatives and filter them by topic, department, or availability.</p>

        <form className="mb-10 grid gap-3 rounded-2xl border border-outline bg-surface p-4 md:grid-cols-[1fr_11rem_11rem_auto]">
          <label className="relative"><Search className="absolute left-3 top-3.5 h-5 w-5 text-foreground/45" /><input name="q" defaultValue={q} placeholder="Project or topic" className="w-full rounded-lg border border-outline bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary" /></label>
          <select name="department" defaultValue={department} aria-label="Filter projects by department" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary">
            {departments.map((item) => <option key={item} value={item}>{item === "all" ? "All departments" : item}</option>)}
          </select>
          <select name="status" defaultValue={status} aria-label="Filter projects by status" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary">
            <option value="all">All statuses</option><option value="open">Open</option><option value="closed">Closed</option>
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest text-background"><Filter className="h-4 w-4" /> Filter</button>
        </form>

        {result.error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-14 text-center text-red-600">Project listings are temporarily unavailable.</div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline p-14 text-center text-foreground/50">No projects match these filters.</div>
        ) : (
          <div className="lazy-card-list space-y-6">
            {projects.map((project) => {
              const faculty = Array.isArray(project.profiles) ? project.profiles[0] : project.profiles;
              return (
                <article key={project.id} className="group flex flex-col gap-6 border border-outline bg-surface p-8 transition-all hover:border-primary md:p-10">
                  <div className="flex items-start justify-between">
                    <span className={`rounded px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${project.status === "open" ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"}`}>{project.status}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">{new Date(project.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                  </div>
                  <div>
                    <h2 className="mb-3 text-2xl font-extrabold text-primary">{project.title}</h2>
                    <span className="inline-block rounded border border-outline bg-background px-2 py-1 text-xs font-bold text-foreground">{project.department}</span>
                    <p className="mt-4 font-medium leading-relaxed text-foreground/65">{project.description}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-sm font-bold text-foreground">{faculty?.full_name || "Unknown faculty"}</span>
                    <Link href={`/projects/${project.id}`} className="flex items-center gap-2 bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">View details <ArrowRight className="h-4 w-4" /></Link>
                  </div>
                </article>
              );
            })}
            <Pagination basePath="/projects" currentPage={result.page} pageSize={result.pageSize} searchParams={{ q, department, status }} totalCount={result.count} />
          </div>
        )}
      </div>
    </div>
  );
}
