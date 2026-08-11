import Link from "next/link";
import { Bell, Calendar, Filter, Search, User } from "lucide-react";
import Pagination from "@/components/shared/Pagination";
import { DEPARTMENTS, getDepartmentCompactLabel, getDepartmentLabel, isDepartmentId } from "@/lib/departments";
import { getPublicNews, getPublicNewsCategories } from "@/lib/public-data";

export default async function News({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; department?: string; page?: string }> }) {
  const params = await searchParams;
  const q = (params?.q || "").trim();
  const categories = await getPublicNewsCategories();
  const category = categories.includes(params?.category || "") ? params?.category || "all" : "all";
  const department = isDepartmentId(params?.department) ? params.department : "all";
  const result = await getPublicNews({ q, category, department, page: Number(params?.page || 1) });
  const newsItems = result.data;

  return (
    <div className="min-h-screen bg-background py-16 font-sans">
      <div className="mx-auto max-w-screen-lg px-6">
        <div className="mb-10 flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Bell className="h-6 w-6" /></div><div><h1 className="text-4xl font-black tracking-tight text-foreground">Research & Technology Briefs</h1><p className="font-medium text-foreground/50">Curated science and engineering developments linked to primary sources.</p></div></div>
        <form className="mb-10 grid gap-3 rounded-2xl border border-outline bg-surface p-4 lg:grid-cols-[1fr_12rem_16rem_auto]">
          <label className="relative"><Search className="absolute left-3 top-3.5 h-5 w-5 text-foreground/50" /><input name="q" defaultValue={q} placeholder="Search research briefs" className="w-full rounded-lg border border-outline bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary" /></label>
          <select name="category" defaultValue={category} aria-label="Filter announcements by category" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select name="department" defaultValue={department} aria-label="Filter announcements by department" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary"><option value="all">All departments</option>{DEPARTMENTS.map((item) => <option key={item.id} value={item.id}>{getDepartmentLabel(item.id)}</option>)}</select>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest text-background"><Filter className="h-4 w-4" /> Filter</button>
        </form>
        {result.error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-12 text-center text-red-600">Announcements are temporarily unavailable.</div>
        ) : newsItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline p-12 text-center text-foreground/50">No announcements match these filters.</div>
        ) : (
          <div className="lazy-card-list space-y-8">
            {newsItems.map((item) => {
              const author = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
              return <article key={item.id} className="group border-y border-r border-l-4 border-outline border-l-primary bg-surface p-10 shadow-sm"><div className="mb-6 flex flex-wrap items-center gap-4"><span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">{item.category || "general"}</span>{item.department && <span className="rounded-full bg-foreground/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground/55">{getDepartmentCompactLabel(item.department)}</span>}<span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/50"><Calendar className="h-3 w-3" /> {new Date(item.created_at).toLocaleDateString()}</span><span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/50"><User className="h-3 w-3" /> {author?.full_name || "NSUT"}</span></div><h2 className="mb-4 text-2xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary md:text-3xl"><Link href={`/news/${item.id}`}>{item.title}</Link></h2><p className="text-lg leading-relaxed text-foreground/70">{item.content}</p><Link href={`/news/${item.id}`} className="mt-6 inline-flex text-xs font-black uppercase tracking-widest text-primary">Read evidence brief →</Link></article>;
            })}
            <Pagination basePath="/news" currentPage={result.page} pageSize={result.pageSize} searchParams={{ q, category, department }} totalCount={result.count} />
          </div>
        )}
      </div>
    </div>
  );
}
