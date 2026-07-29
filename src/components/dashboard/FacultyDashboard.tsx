import { Projector, MessageCircle, Newspaper, Plus, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ToggleProjectStatus } from "./ToggleProjectStatus"; // We will create this client component

export default async function FacultyDashboard({ profile }: { profile: any }) {
  const supabase = await createClient();

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("faculty_id", profile.id)
    .order("created_at", { ascending: false });

  // Fetch applications for these projects
  let pendingCount = 0;
  if (projects && projects.length > 0) {
    const projectIds = projects.map((p) => p.id);
    const { count } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("project_id", projectIds)
      .eq("status", "pending");

    pendingCount = count || 0;
  }

  return (
    <div className="space-y-12">
      <header className="mb-12">
        <h1 className="text-4xl font-display font-black text-primary mb-2 tracking-tight">Faculty Portal</h1>
        <p className="text-foreground/50 font-medium">Welcome, Prof. {profile?.name || "Researcher"}. Manage your research group and projects.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-surface border border-outline p-8 group hover:border-primary transition-all relative">
          <div className="absolute top-4 right-4 bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase">Active</div>
          <Projector className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">My Projects</h3>
          <p className="text-sm text-foreground/50 mb-6">Manage your listed research projects and student applications.</p>
          <div className="flex gap-4">
            <Link href="/dashboard/faculty/projects/new" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
              <Plus size={14} /> New Project
            </Link>
          </div>

          <div className="mt-8 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/50 border-b border-outline pb-2">Recent Projects</h4>
            {projects && projects.length > 0 ? (
              projects.slice(0, 3).map((project) => (
                <div key={project.id} className="flex justify-between items-center text-sm border border-outline p-3 rounded">
                  <div className="truncate pr-4 flex-1">
                    <span className="font-bold block truncate">{project.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold ${project.status === 'open' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                      {project.status}
                    </span>
                  </div>
                  <ToggleProjectStatus projectId={project.id} initialStatus={project.status} />
                </div>
              ))
            ) : (
              <p className="text-xs text-foreground/50 italic">No projects created yet.</p>
            )}
          </div>
        </div>

        <div className="bg-surface border border-outline p-8 group hover:border-primary transition-all relative">
          {pendingCount > 0 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold uppercase">{pendingCount} Pending</div>
          )}
          <Users className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Student Applications</h3>
          <p className="text-sm text-foreground/50 mb-6">Review pending applications from students for your projects.</p>
          <Link href="/dashboard/faculty/applications" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Review Applications</Link>
        </div>

        <div className="bg-surface border border-outline p-8 group hover:border-primary transition-all">
          <BookOpen className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Publications</h3>
          <p className="text-sm text-foreground/50 mb-6">Update your research publications and academic achievements.</p>
          <Link href="/publications" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Manage Papers</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface border border-outline p-8 group hover:border-primary transition-all">
          <MessageCircle className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Department Forum</h3>
          <p className="text-sm text-foreground/50 mb-6">Post official notices or start discussions in your department.</p>
          <Link href="/forum" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Go to Forum</Link>
        </div>

        <div className="bg-surface border border-outline p-8 group hover:border-primary transition-all flex flex-col justify-between">
          <div>
             <Newspaper className="w-10 h-10 text-primary mb-4" />
             <h3 className="text-xl font-bold mb-2">Developments & News</h3>
             <p className="text-sm text-foreground/50 mb-6">Publish institutional news or opportunities to the community feed.</p>
          </div>
          <div className="flex gap-4">
             <Link href="/dashboard/faculty/news/new" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
               <Plus size={14} /> Post News
             </Link>
             <Link href="/dashboard/faculty/opportunities/new" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
               <Plus size={14} /> Post Opportunity
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
