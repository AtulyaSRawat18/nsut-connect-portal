import Link from "next/link";
import { Sparkles, ExternalLink, Calendar, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function WhatsNew() {
  const supabase = await createClient();
  
  let { data: items } = await supabase
    .from('highlights')
    .select('*')
    .order('created_at', { ascending: false });

  // Dummy data fallback
  if (!items || items.length === 0) {
    items = [
      {
        id: '1',
        title: 'Google Research Internship 2026',
        description: 'Applications are now open for the PhD and Master\'s research internship program. Focus areas include Responsible AI and Distributed Systems.',
        type: 'internship',
        deadline: '2026-05-15',
        link_url: 'https://careers.google.com'
      },
      {
        id: '2',
        title: 'Institutional Merit Scholarship',
        description: 'The college is inviting applications for the 2026 Merit Scholarship. Students in the top 5% of their respective departments are eligible to apply.',
        type: 'scholarship',
        deadline: '2026-04-30',
        link_url: '#'
      },
      {
        id: '3',
        title: 'IEEE International Conference @ NSUT',
        description: 'NSUT will be hosting the 12th International Conference on Computing and Communication. Paper submissions are currently open.',
        type: 'event',
        deadline: '2026-08-10',
        link_url: '#'
      }
    ];
  }

  return (
    <div className="min-h-screen bg-surface font-sans py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6">
             <Sparkles className="w-4 h-4 fill-primary" /> What&apos;s New
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-foreground mb-6 tracking-tight">Opportunities & Highlights</h1>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">Explore curated internships, scholarships, and major media events happening across the NSUT ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item: any) => (
            <div key={item.id} className="bg-background border border-outline p-1 rounded-2xl shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden group">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                    item.type === 'internship' ? 'bg-blue-100 text-blue-700' : 
                    item.type === 'scholarship' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {item.type}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest">
                    <Calendar className="w-3 h-3" /> Due {new Date(item.deadline).toLocaleDateString()}
                  </div>
                </div>

                <h3 className="text-2xl font-display font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-foreground/70 text-sm leading-relaxed mb-8">
                  {item.description}
                </p>

                <div className="flex flex-col gap-3 mt-auto">
                   {item.type === 'internship' && (
                     <div className="flex items-center gap-2 text-xs text-foreground/50 font-bold uppercase tracking-widest">
                       <Briefcase className="w-4 h-4" /> Professional Experience
                     </div>
                   )}
                   {item.type === 'scholarship' && (
                     <div className="flex items-center gap-2 text-xs text-foreground/50 font-bold uppercase tracking-widest">
                       <GraduationCap className="w-4 h-4" /> Academic Funding
                     </div>
                   )}
                </div>
              </div>
              
              <Link href={item.link_url} className="block w-full bg-secondary text-white p-4 font-bold uppercase tracking-widest text-center text-xs group-hover:bg-primary transition-colors flex items-center justify-center gap-2">
                Apply / View Details <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
