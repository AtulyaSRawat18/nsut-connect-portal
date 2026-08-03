import { BookOpen, ExternalLink, Filter, Search } from "lucide-react";
import Pagination from "@/components/shared/Pagination";
import { getPublicPublications, getPublicPublicationYears } from "@/lib/public-data";

export default async function Publications({ searchParams }: { searchParams?: Promise<{ q?: string; year?: string; page?: string }> }) {
  const params = await searchParams;
  const q = (params?.q || "").trim();
  const years = await getPublicPublicationYears();
  const year = years.includes(params?.year || "") ? params?.year || "all" : "all";
  const result = await getPublicPublications({ q, year, page: Number(params?.page || 1) });
  const publications = result.data;

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="mx-auto max-w-7xl px-6">
        <h1 className="mb-4 text-4xl font-black tracking-tight text-primary">Research Publications</h1>
        <p className="mb-10 max-w-2xl text-foreground/70">Access research output from Netaji Subhas University of Technology.</p>
        <form className="mb-12 grid gap-3 rounded-2xl border border-outline bg-surface p-4 sm:grid-cols-[1fr_12rem_auto]">
          <label className="relative"><Search className="absolute left-3 top-3.5 h-5 w-5 text-foreground/50" /><input name="q" defaultValue={q} placeholder="Paper title" className="w-full rounded-lg border border-outline bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary" /></label>
          <select name="year" defaultValue={year} aria-label="Filter publications by year" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary"><option value="all">All years</option>{years.map((item) => <option key={item} value={item}>{item === "forthcoming" ? "Forthcoming" : item}</option>)}</select>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest text-background"><Filter className="h-4 w-4" /> Filter</button>
        </form>
        {result.error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-12 text-center text-red-600">Publications are temporarily unavailable.</div>
        ) : publications.length === 0 ? (
          <div className="border border-dashed border-outline p-12 text-center text-foreground/50">No publications match these filters.</div>
        ) : (
          <div className="lazy-card-list space-y-6">
            {publications.map((publication) => (
              <article key={publication.id} className="group border border-outline bg-surface p-8 transition-all hover:border-primary">
                <div className="flex items-start gap-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-primary/5 text-primary transition-all group-hover:bg-primary group-hover:text-white"><BookOpen className="h-6 w-6" /></div>
                  <div className="min-w-0 flex-1"><h2 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">{publication.title}</h2><p className="mb-4 text-sm text-foreground/70">{(publication.authors || []).join(", ")} ({publication.published_date ? new Date(publication.published_date).getFullYear() : "Forthcoming"})</p>{publication.url && <a href={publication.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/50 transition-colors hover:text-primary"><ExternalLink className="h-4 w-4" /> Open publication</a>}</div>
                </div>
              </article>
            ))}
            <Pagination basePath="/publications" currentPage={result.page} pageSize={result.pageSize} searchParams={{ q, year }} totalCount={result.count} />
          </div>
        )}
      </div>
    </div>
  );
}