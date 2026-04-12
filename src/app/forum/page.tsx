import Link from "next/link";
import { Search, MessageSquare, ThumbsUp, CheckCircle, Bot, Filter, User, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Forum() {
  const supabase = await createClient();
  
  let { data: posts } = await supabase
    .from('forum_posts')
    .select('*, profiles(full_name, role)')
    .order('created_at', { ascending: false });

  // Dummy data fallback
  if (!posts || posts.length === 0) {
    posts = [
      {
        id: '1',
        title: 'Best practices for securing IoT edge nodes?',
        content: 'I am currently working on a project involving remote sensors. What are the recommended security patches for low-power devices...',
        department: 'CSE',
        upvotes: 24,
        created_at: new Date().toISOString(),
        profiles: { full_name: 'Rahul Mehta', role: 'student' }
      },
      {
        id: '2',
        title: 'Upcoming Research Symposium: Call for Papers',
        content: 'Faculty and students are invited to submit their work for the upcoming Annual Research Symposium scheduled for November.',
        department: 'General',
        upvotes: 56,
        created_at: new Date().toISOString(),
        profiles: { full_name: 'Dr. Ramesh Kumar', role: 'faculty' }
      },
      {
        id: '3',
        title: 'Comparing LSTMs vs Transformers for Time-Series',
        content: 'Has anyone benchmarked Transformer models against traditional LSTMs for solar energy forecasting? I am seeing mixed results...',
        department: 'IT',
        upvotes: 12,
        created_at: new Date().toISOString(),
        profiles: { full_name: 'Sanya Gupta', role: 'student' }
      }
    ];
  }

  return (
    <div className="min-h-screen bg-background font-sans py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-display font-black text-primary mb-4 tracking-tight">Academic Forum</h1>
            <p className="text-lg text-foreground/70 font-medium">Connect, discuss, and share research insights with the NSUT community.</p>
          </div>
          <button className="bg-primary text-white px-8 py-4 font-bold uppercase tracking-widest text-xs rounded shadow-lg hover:bg-primary-dark transition-all">
            Start a Discussion
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-surface border border-outline p-4 flex items-center gap-4 focus-within:ring-2 focus-within:ring-primary transition-all">
              <Search className="w-5 h-5 text-foreground/50 ml-2" />
              <input 
                type="text" 
                placeholder="Search discussions, topics, or faculty tags..." 
                className="w-full bg-transparent border-none focus:ring-0 text-foreground font-medium"
              />
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.map((post: any) => (
                <div key={post.id} className="bg-surface border border-outline hover:border-primary/50 transition-all p-8 rounded-lg group">
                  <div className="flex gap-6">
                    {/* Voting */}
                    <div className="flex flex-col items-center gap-2">
                       <button className="p-2 hover:bg-primary/10 rounded transition-colors text-foreground/50 hover:text-primary">
                         <ThumbsUp className="w-5 h-5" />
                       </button>
                       <span className="font-bold text-foreground">{post.upvotes}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded">
                          {post.department}
                        </span>
                        {post.profiles?.role === 'faculty' && (
                          <span className="flex items-center gap-1 bg-secondary text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded">
                            <CheckCircle className="w-3 h-3" /> Faculty Verified
                          </span>
                        )}
                        <span className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest ml-auto">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <Link href={`/forum/${post.id}`} className="block">
                         <h3 className="text-xl font-display font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                           {post.title}
                         </h3>
                      </Link>
                      <p className="text-foreground/70 text-sm line-clamp-2 mb-6 leading-relaxed">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xs text-foreground/50 font-bold">
                          <User className="w-4 h-4" /> {post.profiles?.full_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-foreground/50 font-bold">
                          <MessageSquare className="w-4 h-4" /> 12 Replies
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* AI Suggested Answers */}
            <div className="bg-gradient-to-br from-primary to-primary-dark p-8 rounded-xl text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="w-6 h-6" />
                <h3 className="font-display font-bold text-lg">AI Smart Insights</h3>
              </div>
              <p className="text-white/80 text-xs leading-relaxed mb-6 italic">
                &quot;Recent discussions show a high interest in Edge Computing. Check out the latest resources in the CSE department feed.&quot;
              </p>
              <button className="w-full bg-white text-primary py-3 rounded font-bold uppercase tracking-widest text-[10px] hover:bg-white/90 transition-colors">
                Explore Insights
              </button>
            </div>

            {/* Popular Departments */}
            <div className="bg-surface border border-outline p-8 rounded-lg">
              <h4 className="font-bold text-xs text-foreground/50 tracking-widest uppercase mb-6 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter by Dept
              </h4>
              <div className="space-y-4">
                {['General', 'CSE', 'IT', 'ECE', 'MAC'].map(dept => (
                  <Link key={dept} href="#" className="flex justify-between items-center text-sm font-bold text-foreground/80 hover:text-primary transition-colors group">
                    <span>{dept}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
