import Link from "next/link";
import { Briefcase, Calendar, Filter, GraduationCap, Search, Trophy } from "lucide-react";
import Pagination from "@/components/shared/Pagination";
import PageHeading from "@/components/shared/PageHeading";
import { DEPARTMENTS, getDepartmentCompactLabel, getDepartmentLabel, isDepartmentId } from "@/lib/departments";
import { getPublicOpportunities } from "@/lib/public-data";

const types = ["all", "internship", "scholarship", "event", "highlight"] as const;
const deadlines = ["all", "open", "closed", "none"] as const;

export default async function OpportunitiesDirectory({ searchParams, title = "Research & careers", basePath = "/opportunities" }: { searchParams?: Promise<{ q?: string; type?: string; deadline?: string; department?: string; page?: string }>; title?: string; basePath?: string }) {
  const params = await searchParams;
  const q = (params?.q || "").trim();
  const type = types.includes(params?.type as (typeof types)[number]) ? params?.type || "all" : "all";
  const deadline = deadlines.includes(params?.deadline as (typeof deadlines)[number]) ? params?.deadline || "all" : "all";
  const department = isDepartmentId(params?.department) ? params.department : "all";
  const result = await getPublicOpportunities({ q, type, deadline, department, page: Number(params?.page || 1) });
  const items = result.data;

  return (
    <div className="portal-page">
      <div className="portal-container">
        <PageHeading eyebrow="Take the next step" title={title} description="Discover internships, scholarships, campus events, and opportunities beyond your department." />
        <form className="portal-filter-bar xl:grid-cols-[minmax(0,1fr)_10rem_11rem_16rem_auto]">
          <label className="relative"><Search className="absolute left-3 top-3.5 h-5 w-5 text-foreground/50" /><input type="search" aria-label="Search opportunities" name="q" defaultValue={q} placeholder="Search opportunities" className="w-full rounded-lg border border-outline bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary" /></label>
          <select name="type" defaultValue={type} aria-label="Filter opportunities by type" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary">{types.map((item) => <option key={item} value={item}>{item === "all" ? "All types" : item}</option>)}</select>
          <select name="deadline" defaultValue={deadline} aria-label="Filter opportunities by deadline" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary"><option value="all">Any deadline</option><option value="open">Open</option><option value="closed">Expired</option><option value="none">No deadline</option></select>
          <select name="department" defaultValue={department} aria-label="Filter opportunities by department" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary"><option value="all">All departments</option>{DEPARTMENTS.map((item) => <option key={item.id} value={item.id}>{getDepartmentLabel(item.id)}</option>)}</select>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-xs font-bold normal-case tracking-normal text-background"><Filter className="h-4 w-4" /> Filter</button>
        </form>
        {result.error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-12 text-center text-red-600">Opportunities are temporarily unavailable.</div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-outline p-12 text-center text-foreground/50">No opportunities match these filters.</div>
        ) : (
          <div className="lazy-card-list grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="group flex flex-col justify-between border border-outline bg-surface shadow-sm transition-all hover:border-primary"><div className="p-8"><div className="mb-6 flex items-start justify-between gap-3"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold normal-case tracking-normal text-primary">{item.type}</span>{item.department && <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-bold normal-case tracking-normal text-foreground/55">{getDepartmentCompactLabel(item.department)}</span>}</div>{item.deadline && <span className="flex items-center gap-1 text-xs font-semibold normal-case tracking-normal text-foreground/50"><Calendar className="h-3.5 w-3.5" /> {new Date(item.deadline).toLocaleDateString()}</span>}</div><h2 className="mb-4 text-2xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary">{item.title}</h2><p className="mb-6 text-sm leading-relaxed text-foreground/60">{item.description}</p><div className="flex items-center gap-2 text-xs font-bold normal-case tracking-normal text-foreground/45">{item.type === "internship" ? <Briefcase className="h-3.5 w-3.5" /> : item.type === "scholarship" ? <GraduationCap className="h-3.5 w-3.5" /> : <Trophy className="h-3.5 w-3.5" />}{item.type}</div></div><Link href={`/opportunities/${item.id}`} className="flex items-center justify-center gap-2 border-t border-outline bg-background p-4 text-center text-xs font-bold normal-case tracking-normal text-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">Review full details →</Link></article>
            ))}
            <div className="col-span-full"><Pagination basePath={basePath} currentPage={result.page} pageSize={result.pageSize} searchParams={{ q, type, deadline, department }} totalCount={result.count} /></div>
          </div>
        )}
      </div>
    </div>
  );
}
