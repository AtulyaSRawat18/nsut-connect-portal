import Link from "next/link";
import { Sparkles, ExternalLink, Calendar, Briefcase, GraduationCap, Trophy, Plus, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function OpportunitiesPage() {
  const supabase = await createClient();

  let { data: items } = await supabase
    .from("highlights")
    .select("*")
    .order("created_at", { ascending: false });

  // Get active session to see if we should show "Post Opportunity" button
  const { data: { user } } = await supabase.auth.getUser();
  let isContentHandler = false;

  if (user) {
    const { data: profile } = await supabase
      .from("portal_users")
      .select("role, is_content_handler")
      .eq("id", user.id)
      .single();

    if (profile && (profile.role === "faculty" || profile.is_content_handler)) {
      isContentHandler = true;
    }
  }

  // Fallback mock data
  if (!items || items.length === 0) {
    items = [
      {
        id: "1",
        title: "Google PhD Fellowship 2026",
        description: "Direct fellowship opportunities for outstanding PhD researchers in computer science and related fields. Tuition and stipend covered.",
        type: "scholarship",
        deadline: "2026-09-30",
        link_url: "https://research.google/scholarships/",
      },
      {
        id: "2",
        title: "Mitacs Globalink Research Internship",
        description: "Fully funded 12-week research internships in Canada. Open to third-year undergraduate students across engineering branches.",
        type: "internship",
        deadline: "2026-09-22",
        link_url: "https://www.mitacsglobalink.ca/",
      },
      {
        id: "3",
        title: "Smart India Hackathon 2026",
        description: "National product dev competition. NSUT internal selections will begin next month. Register your teams now.",
        type: "event",
        deadline: "2026-10-15",
        link_url: "https://sih.gov.in",
      }
    ];
  }

  return (
    <div className="min-h-screen bg-background font-sans py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 fill-primary" /> Opportunities Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-foreground tracking-tight mb-2">Research & Careers</h1>
            <p className="text-foreground/50 max-w-xl font-medium">Explore curated internships, scholarships, and hackathons in the NSUT ecosystem.</p>
          </div>

          {isContentHandler && (
            <Link href="/dashboard/opportunities/new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-4 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-sm">
              <Plus size={14} /> Post Opportunity
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item: any) => (
            <div key={item.id} className="bg-surface border border-outline flex flex-col justify-between shadow-sm transition-all hover:border-primary group">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full ${
                    item.type === "internship" ? "bg-blue-500/10 text-blue-500" :
                    item.type === "scholarship" ? "bg-purple-500/10 text-purple-500" :
                    item.type === "event" ? "bg-amber-500/10 text-amber-500" :
                    "bg-foreground/10 text-foreground/75"
                  }`}>
                    {item.type}
                  </span>
                  {item.deadline && (
                    <div className="flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5" /> Due {new Date(item.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                <p className="text-foreground/60 text-sm leading-relaxed mb-6">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 text-[10px] text-foreground/40 font-bold uppercase tracking-widest mt-auto">
                  {item.type === "internship" && <Briefcase className="w-3.5 h-3.5" />}
                  {item.type === "scholarship" && <GraduationCap className="w-3.5 h-3.5" />}
                  {item.type === "event" && <Trophy className="w-3.5 h-3.5" />}
                  {item.type === "internship" ? "Work Experience" : item.type === "scholarship" ? "Academic Fund" : "Competition"}
                </div>
              </div>

              {item.link_url && (
                <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="block w-full bg-surface-variant border-t border-outline text-foreground p-4 font-bold uppercase tracking-widest text-center text-[10px] group-hover:bg-primary group-hover:text-primary-foreground transition-all flex items-center justify-center gap-2">
                  Apply & Explore <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
