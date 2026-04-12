import Link from "next/link";
import { Calendar, User, ArrowRight, Bell } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function News() {
  const supabase = await createClient();
  
  let { data: newsItems } = await supabase
    .from('announcements')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false });

  // Dummy data fallback
  if (!newsItems || newsItems.length === 0) {
    newsItems = [
      {
        id: '1',
        title: 'New Institutional Ethics Guidelines for Research with Human Subjects',
        content: 'The NSUT Research Office has released updated compliance standards for all projects involving behavioral and medical data. All researchers must re-submit their ethics review by the end of this month.',
        category: 'Compliance',
        created_at: new Date().toISOString(),
        profiles: { full_name: 'Registrar Office' }
      },
      {
        id: '2',
        title: 'Summer Research Internship Fair 2026',
        content: 'Join us at the Main Auditorium this Friday to meet with industry partners offering summer research opportunities and collaborative projects.',
        category: 'Events',
        created_at: new Date().toISOString(),
        profiles: { full_name: 'Placement Cell' }
      },
      {
        id: '3',
        title: 'Faculty Grant Submissions: Open Call',
        content: 'Applications are now open for internal research seed grants for the next academic year. Early-career faculty are strongly encouraged to apply.',
        category: 'Grants',
        created_at: new Date().toISOString(),
        profiles: { full_name: 'Director (R&D)' }
      }
    ];
  }

  return (
    <div className="min-h-screen bg-background font-sans py-16">
      <div className="max-w-screen-lg mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
           <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
             <Bell className="w-6 h-6" />
           </div>
           <div>
             <h1 className="text-4xl font-display font-black text-foreground tracking-tight">System Announcements</h1>
             <p className="text-foreground/50 font-medium">Keep up with the latest institutional news and research updates.</p>
           </div>
        </div>

        <div className="space-y-8">
          {newsItems.map((item: any) => (
            <div key={item.id} className="bg-surface border-l-4 border-primary border-y border-r border-outline p-10 shadow-sm transition-all hover:shadow-md group">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                 <span className="bg-primary/10 text-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full">
                   {item.category}
                 </span>
                 <div className="flex items-center gap-2 text-[10px] text-foreground/50 font-bold uppercase tracking-widest">
                   <Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
                 </div>
                 <div className="flex items-center gap-2 text-[10px] text-foreground/50 font-bold uppercase tracking-widest">
                   <User className="w-3 h-3" /> {item.profiles?.full_name}
                 </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">
                {item.title}
              </h2>
              
              <p className="text-foreground/70 leading-relaxed mb-8 text-lg">
                {item.content}
              </p>
              
              <Link href={`/news/${item.id}`} className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:underline">
                Read Full Announcement <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Admin Publish UI (Mocked for Demo) */}
        <div className="mt-24 p-8 border-2 border-dashed border-outline rounded-xl text-center">
           <p className="text-foreground/50 text-sm font-medium mb-4 italic">You are viewing the news feed as a visitor. Faculty members can publish news via the dashboard.</p>
           <Link href="/admin/news/new" className="inline-block border border-outline px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-surface transition-colors">
             Go to Admin Dashboard
           </Link>
        </div>
      </div>
    </div>
  );
}
