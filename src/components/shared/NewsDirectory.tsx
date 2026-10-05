import Link from "next/link";
import { Calendar, Filter, Search, User } from "lucide-react";
import Pagination from "@/components/shared/Pagination";
import PageHeading from "@/components/shared/PageHeading";
import { DEPARTMENTS, getDepartmentCompactLabel, getDepartmentLabel, isDepartmentId } from "@/lib/departments";
import { getPublicNews, getPublicNewsCategories } from "@/lib/public-data";

export default async function NewsDirectory({ searchParams, title = "Research & technology briefs", basePath = "/news" }: { searchParams?: Promise<{ q?: string; category?: string; department?: string; page?: string }>; title?: string; basePath?: string }) {
  const params = await searchParams;
  const q = (params?.q || "").trim();
  const categories = await getPublicNewsCategories();
  const category = categories.includes(params?.category || "") ? params?.category || "all" : "all";
  const department = isDepartmentId(params?.department) ? params.department : "all";
  const result = await getPublicNews({ q, category, department, page: Number(params?.page || 1) });
  const newsItems = result.data;

  return (
    <div className="portal-page">
      <div className="portal-container">
        <PageHeading eyebrow="The reading room" title={title} description="Science and engineering developments, with the primary sources to explore them further." />
        <form className="portal-filter-bar lg:grid-cols-[minmax(0,1fr)_12rem_16rem_auto]">
          <label className="relative"><Search className="absolute left-3 top-3.5 h-5 w-5 text-foreground/50" /><input type="search" aria-label="Search research briefs" name="q" defaultValue={q} placeholder="Search research briefs" className="w-full rounded-lg border border-outline bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary" /></label>
          <select name="category" defaultValue={category} aria-label="Filter announcements by category" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select name="department" defaultValue={department} aria-label="Filter announcements by department" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary"><option value="all">All departments</option>{DEPARTMENTS.map((item) => <option key={item.id} value={item.id}>{getDepartmentLabel(item.id)}</option>)}</select>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-xs font-bold normal-case tracking-normal text-background"><Filter className="h-4 w-4" /> Filter</button>
        </form>
        {result.error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-12 text-center text-red-600">Announcements are temporarily unavailable.</div>
        ) : newsItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-outline p-12 text-center text-foreground/50">No announcements match these filters.</div>
        ) : (
          <div className="lazy-card-list space-y-8">
            {newsItems.map((item) => {
              const author = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
              return <article key={item.id} className="group border-y border-r border-l-4 border-outline border-l-primary bg-surface p-10 shadow-sm"><div className="mb-6 flex flex-wrap items-center gap-4"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold normal-case tracking-normal text-primary">{item.category || "general"}</span>{item.department && <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-bold normal-case tracking-normal text-foreground/55">{getDepartmentCompactLabel(item.department)}</span>}<span className="flex items-center gap-2 text-xs font-bold normal-case tracking-normal text-foreground/50"><Calendar className="h-3 w-3" /> {new Date(item.created_at).toLocaleDateString()}</span><span className="flex items-center gap-2 text-xs font-bold normal-case tracking-normal text-foreground/50"><User className="h-3 w-3" /> {author?.full_name || "NSUT"}</span></div><h2 className="mb-4 text-2xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary md:text-3xl"><Link href={`/news/${item.id}`}>{item.title}</Link></h2><p className="text-lg leading-relaxed text-foreground/70">{item.content}</p><Link href={`/news/${item.id}`} className="mt-6 inline-flex text-xs font-semibold normal-case tracking-normal text-primary">Read evidence brief →</Link></article>;
            })}
            <Pagination basePath={basePath} currentPage={result.page} pageSize={result.pageSize} searchParams={{ q, category, department }} totalCount={result.count} />
          </div>
        )}
      </div>
    </div>
  );
}
