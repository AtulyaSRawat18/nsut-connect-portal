import Link from "next/link";
import { Search, Filter, Share2, MessageSquare, Bot, ArrowUpRight, Zap } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Developments(props: { searchParams?: Promise<{ category?: string }> }) {
  const supabase = await createClient();
  const searchParams = await props.searchParams;
  const categoryParams = searchParams?.category || 'All';

  // Custom query based on category
  let query = supabase
    .from('announcements')
    .select('*, portal_users(name)')
    .order('created_at', { ascending: false });

  if (categoryParams !== 'All') {
    query = query.eq('category', categoryParams.toLowerCase());
  }

  let { data: items } = await query;

  // Dummy data fallback
  if (!items || items.length === 0) {
    items = [
      {
        id: '1',
        title: 'New Paper: Scalable Blockchain Architecture for IoT',
        content: 'Researchers from the CSE department have published a groundbreaking approach to blockchain sharding which could increase IoT network throughput by 300%. This marks a significant milestone in distributed systems research at NSUT.',
        category: 'research',
        created_at: new Date().toISOString(),
        portal_users: { name: 'Dr. Vivek Singh' }
      },
      {
        id: '2',
        title: 'Patents Filed: Smart Material for Battery Cathodes',
        content: 'Mechanical Engineering laboratory team files patent for a new composite material that significantly improves thermal stability in electric vehicle batteries.',
        category: 'general',
        created_at: new Date().toISOString(),
        portal_users: { name: 'Dr. Sandeep Kumar' }
      },
      {
        id: '3',
        title: 'NSUT Team Wins Global Robotics Challenge',
        content: 'The undergraduate robotics team has secured first place in the International Autonomous Navigation competition held in Tokyo.',
        category: 'academic',
        created_at: new Date().toISOString(),
        portal_users: { name: 'Prof. A. Bansal' }
      }
    ];
  }

  return (
    <div className="min-h-screen bg-background font-sans py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* Main Feed */}
          <div className="flex-1 space-y-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-black text-foreground mb-4 tracking-tight">Developments Feed</h1>
              <p className="text-foreground/50 font-medium">Curated academic updates, news, and research opportunities across NSUT.</p>
            </div>

            {/* Feed Filter */}
            <div className="flex flex-wrap gap-4 border-b border-outline pb-6">
               {['All', 'General', 'Research', 'Academic', 'Event'].map(cat => (
                 <Link href={cat === 'All' ? '/developments' : `/developments?category=${cat}`} key={cat} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full border border-outline transition-all hover:border-primary ${categoryParams === cat ? 'bg-primary text-white border-primary' : 'bg-surface text-foreground/50'}`}>
                   {cat}
                 </Link>
               ))}
            </div>

            {/* List of Developments */}
            <div className="space-y-12">
              {items.map((item: any) => (
                <div key={item.id} className="group">
                  <div className="flex flex-col md:flex-row gap-8 items-start bg-surface border border-outline p-6 rounded-xl hover:border-primary transition-colors duration-300">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase px-2 py-1 bg-primary/10 rounded">{item.category}</span>
                          <span className="w-1 h-1 rounded-full bg-outline" />
                          <span className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <h2 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {item.title}
                      </h2>

                      <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                         {item.content || "Read more about this development by clicking through."}
                      </p>

                      <div className="flex items-center justify-between border-t border-outline pt-4 mt-6">
                         <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                               {(item.portal_users?.name || 'A')?.charAt(0)}
                             </div>
                             <span className="text-xs font-bold text-foreground/60">{item.portal_users?.name || 'Admin'}</span>
                         </div>
                         <div className="flex items-center gap-4">
                           <button className="flex items-center gap-2 text-[10px] font-bold text-foreground/50 hover:text-primary transition-colors uppercase tracking-widest">
                             <Share2 className="w-4 h-4" /> Share
                           </button>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Trending / Editor tags */}
          <div className="w-full lg:w-1/3 xl:w-1/4 space-y-12">
             <div className="bg-secondary p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden">
                <Zap className="absolute top-4 right-4 w-12 h-12 text-primary/20 -rotate-12" />
                <h3 className="text-xl font-display font-bold mb-4 relative z-10">Trending Topics</h3>
                <div className="flex flex-wrap gap-2 relative z-10">
                   {['#EdgeAI', '#QuantumComputing', '#SmartGrid', '#GreenHydrogen', '#Blockchain'].map(tag => (
                     <span key={tag} className="bg-white/10 hover:bg-white/20 transition-colors px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest cursor-pointer">
                       {tag}
                     </span>
                   ))}
                </div>
             </div>

             <div className="border border-outline p-8 rounded-xl bg-surface">
               <h4 className="text-xs font-black text-foreground/50 tracking-[0.2em] uppercase mb-8">Faculty Insights</h4>
               <div className="space-y-8">
                  {[1,2].map(i => (
                    <div key={i} className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0" />
                       <div>
                          <p className="text-[10px] font-bold text-foreground leading-snug mb-1">&quot;The new robotics lab opening marks a significant milestone for BT students.&quot;</p>
                          <p className="text-[8px] font-black text-primary uppercase tracking-widest">Dr. Aman Jain</p>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
