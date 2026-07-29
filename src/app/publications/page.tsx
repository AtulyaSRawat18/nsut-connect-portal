import { BookOpen, Search, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

type PublicationRow = {
  id: string;
  title: string;
  authors: string[] | null;
  published_date: string | null;
  url: string | null;
  portal_users: { name: string }[];
};

export default async function Publications() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("publications")
    .select("id, title, authors, published_date, url, portal_users!publications_faculty_id_fkey(name)")
    .order("published_date", { ascending: false });
  const publications = data || [];

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-display font-black text-primary mb-4 tracking-tight">Research Publications</h1>
        <p className="text-foreground/70 mb-12 max-w-2xl">Access the peer-reviewed research output from Netaji Subhas University of Technology.</p>

        <div className="bg-surface border border-outline p-4 flex items-center gap-4 mb-12">
          <Search className="w-5 h-5 text-foreground/50 ml-2" />
          <input type="text" placeholder="Search by paper title, author, or journal..." className="w-full bg-transparent border-none focus:ring-0 text-foreground" />
        </div>

        <div className="space-y-6">
          {(publications as PublicationRow[]).map((p) => (
            <div key={p.id} className="bg-surface border border-outline p-8 hover:border-primary transition-all group">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-primary/5 rounded flex-shrink-0 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                  <p className="text-sm text-foreground/70 mb-4">
                    {(p.authors || []).join(", ")} •{" "}
                    <span className="font-bold text-primary">{p.portal_users?.[0]?.name || "NSUT Research"}</span>{" "}
                    ({p.published_date ? new Date(p.published_date).getFullYear() : "Forthcoming"})
                  </p>
                  <div className="flex gap-4">
                    <Link href={p.url || "#"} className="flex items-center gap-2 text-[10px] font-bold text-foreground/50 hover:text-primary uppercase tracking-widest transition-colors">
                      <Download className="w-4 h-4" /> PDF
                    </Link>
                    <Link href={p.url || "#"} className="flex items-center gap-2 text-[10px] font-bold text-foreground/50 hover:text-primary uppercase tracking-widest transition-colors">
                      <ExternalLink className="w-4 h-4" /> DOI
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {publications.length === 0 && (
            <div className="border border-dashed border-outline p-12 text-center text-foreground/50">
              No publications have been added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
