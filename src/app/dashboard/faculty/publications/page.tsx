import { ExternalLink, Filter, Search } from "lucide-react";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import PublicationForm from "./PublicationForm";
type PublicationRow = {
  id: string;
  title: string;
  authors: string[];
  published_date: string | null;
  url: string | null;
  created_at: string;
};

export default async function FacultyPublicationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; year?: string }>;
}) {
  const identity = await requirePageIdentity({ permissions: ["publication.manage.own"] });
  const params = await searchParams;
  const q = (params?.q || "").trim().toLowerCase();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publications")
    .select("id, title, authors, published_date, url, created_at")
    .eq("faculty_id", identity.id)
    .order("published_date", { ascending: false, nullsFirst: false });

  const allPublications = (data || []) as PublicationRow[];
  const years = Array.from(new Set(allPublications.map((publication) => publication.published_date ? String(new Date(publication.published_date).getFullYear()) : "forthcoming"))).sort().reverse();
  const year = years.includes(params?.year || "") ? params?.year || "all" : "all";
  const publications = allPublications.filter((publication) => {
    const matchesQuery = !q || publication.title.toLowerCase().includes(q) || publication.authors.some((author) => author.toLowerCase().includes(q));
    const publicationYear = publication.published_date ? String(new Date(publication.published_date).getFullYear()) : "forthcoming";
    return matchesQuery && (year === "all" || publicationYear === year);
  });

  return (
    <div className="space-y-8">
      <header><p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Academic record</p><h1 className="text-4xl font-black text-foreground">Publications</h1><p className="mt-3 text-foreground/55">Maintain the research output shown on your public profile.</p></header>
      <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
        <PublicationForm />
        <section className="space-y-4">
          <form className="grid gap-3 rounded-2xl border border-outline bg-surface p-4 sm:grid-cols-[1fr_10rem_auto]">
            <label className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-foreground/40" /><input name="q" defaultValue={params?.q || ""} placeholder="Title or author" className="w-full rounded-lg border border-outline bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary" /></label>
            <select name="year" defaultValue={year} aria-label="Filter publications by year" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary">
              <option value="all">All years</option>{years.map((item) => <option key={item} value={item}>{item === "forthcoming" ? "Forthcoming" : item}</option>)}
            </select>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest text-background"><Filter className="h-4 w-4" /> Filter</button>
          </form>

          {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-12 text-center text-red-600">Publications are temporarily unavailable.</div> : publications.map((publication) => (
            <article key={publication.id} className="rounded-2xl border border-outline bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-lg font-black text-foreground">{publication.title}</h2><p className="mt-2 text-sm text-foreground/55">{publication.authors.join(", ")}</p></div>
                {publication.url && <a href={publication.url} target="_blank" rel="noreferrer" aria-label="Open publication" className="rounded-lg border border-outline p-2 text-primary hover:bg-primary/5"><ExternalLink className="h-4 w-4" /></a>}
              </div>
              <p className="mt-5 border-t border-outline pt-4 text-xs text-foreground/45">{publication.published_date ? new Date(publication.published_date).toLocaleDateString() : "Publication date not supplied"}</p>
            </article>
          ))}
          {!error && publications.length === 0 && <div className="rounded-2xl border border-dashed border-outline p-14 text-center text-foreground/45">No publications match these filters.</div>}
        </section>
      </div>
    </div>
  );
}
