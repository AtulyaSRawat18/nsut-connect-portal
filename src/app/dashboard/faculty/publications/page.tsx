import { ExternalLink } from "lucide-react";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import PublicationForm from "./PublicationForm";

export default async function FacultyPublicationsPage() {
  const identity = await requirePageIdentity({ permissions: ["publication.manage.own"] });
  const supabase = await createClient();
  const { data: publications } = await supabase
    .from("publications")
    .select("id, title, authors, published_date, url, created_at")
    .eq("faculty_id", identity.id)
    .order("published_date", { ascending: false, nullsFirst: false });

  return (
    <div className="space-y-8">
      <header><p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Academic record</p><h1 className="text-4xl font-black text-foreground">Publications</h1><p className="mt-3 text-foreground/55">Maintain the research output shown on your public profile.</p></header>
      <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
        <PublicationForm />
        <section className="space-y-4">
          {(publications || []).map((publication) => (
            <article key={publication.id} className="rounded-2xl border border-outline bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-lg font-black text-foreground">{publication.title}</h2><p className="mt-2 text-sm text-foreground/55">{publication.authors.join(", ")}</p></div>
                {publication.url && <a href={publication.url} target="_blank" rel="noreferrer" aria-label="Open publication" className="rounded-lg border border-outline p-2 text-primary hover:bg-primary/5"><ExternalLink className="h-4 w-4" /></a>}
              </div>
              <p className="mt-5 border-t border-outline pt-4 text-xs text-foreground/45">{publication.published_date ? new Date(publication.published_date).toLocaleDateString() : "Publication date not supplied"}</p>
            </article>
          ))}
          {(publications || []).length === 0 && <div className="rounded-2xl border border-dashed border-outline p-14 text-center text-foreground/45">No publications have been added.</div>}
        </section>
      </div>
    </div>
  );
}
