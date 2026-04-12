import { LayoutDashboard, Projector, MessageCircle, Newspaper, Settings, User } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-4xl font-display font-black text-primary mb-2 tracking-tight">Institutional Dashboard</h1>
          <p className="text-foreground/50 font-medium">Welcome back, {user?.email || "Researcher"}. Manage your projects and collaborations.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Quick Stats */}
          <div className="bg-surface border border-outline p-8 group hover:border-primary transition-all">
             <Projector className="w-10 h-10 text-primary mb-4" />
             <h3 className="text-xl font-bold mb-2">My Projects</h3>
             <p className="text-sm text-foreground/50 mb-6">Track your active research applications and mentoring requests.</p>
             <Link href="/projects" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">View Projects</Link>
          </div>

          <div className="bg-surface border border-outline p-8 group hover:border-primary transition-all">
             <MessageCircle className="w-10 h-10 text-primary mb-4" />
             <h3 className="text-xl font-bold mb-2">Forum Activity</h3>
             <p className="text-sm text-foreground/50 mb-6">Join discussions in your department and answer student queries.</p>
             <Link href="/forum" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Manage Posts</Link>
          </div>

          <div className="bg-surface border border-outline p-8 group hover:border-primary transition-all">
             <Newspaper className="w-10 h-10 text-primary mb-4" />
             <h3 className="text-xl font-bold mb-2">Announcements</h3>
             <p className="text-sm text-foreground/50 mb-6">Publish institutional news or funding grants to the community.</p>
             <Link href="/news" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Post News</Link>
          </div>
        </div>

        <div className="mt-16 bg-surface-container-lowest border border-outline p-10 rounded-2xl">
           <div className="flex items-center gap-4 mb-6">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-display font-bold">Profile Settings</h2>
           </div>
           <p className="text-foreground/70 mb-8 max-w-2xl text-sm leading-relaxed">Ensure your research interests and department are correctly set to receive relevant project invitations and AI-summarized developments.</p>
           <Link href={`/profile/${user?.id || 'owner'}`} className="inline-block bg-primary text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded hover:bg-primary-dark transition-all">
              Update Profile <User className="inline-block ml-2 w-4 h-4" />
           </Link>
        </div>
      </div>
    </div>
  );
}
