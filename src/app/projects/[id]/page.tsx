import Link from "next/link";
import { ArrowLeft, FileText, Calendar, Users, Briefcase, Bot } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ApplyProjectButton } from "@/components/projects/ApplyProjectButton";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch project details
  let { data: project } = await supabase
    .from("projects")
    .select("*, portal_users(id, name, role)")
    .eq("id", id)
    .single();

  if (!project) notFound();

  // Fetch related projects (same department, excluding current)
  let { data: relatedProjects } = await supabase
    .from("projects")
    .select("id, title, department, portal_users(name)")
    .eq("department", project.department)
    .neq("id", id)
    .limit(3);

  // Check if current user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background font-sans py-16">
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/projects" className="inline-flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase hover:underline mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <div className="flex gap-3 mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded">
                  {project.department}
                </span>
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${project.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {project.status}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground leading-tight mb-6">
                {project.title}
              </h1>
              <p className="text-lg text-foreground/80 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* AI Assistant Panel */}
            <div className="bg-gradient-to-r from-primary/5 to-primary-dark/10 border border-primary/20 p-8 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="w-6 h-6 text-primary" />
                <h3 className="font-display font-bold text-xl text-foreground">AI Application Assistant</h3>
              </div>
              <p className="text-foreground/70 mb-6 text-sm">Need help drafting your application statement or understanding the prerequisites for this project? Provide your background, and our AI will help scaffold your proposal.</p>
              <form className="flex gap-4">
                <input
                  type="text"
                  placeholder="I am a 3rd year CSE student with experience in..."
                  className="flex-1 bg-surface border border-outline placeholder:text-outline p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="button" className="bg-primary text-on-primary px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-primary-dark transition-colors">
                  Generate Draft
                </button>
              </form>
            </div>

            <div className="border border-outline p-8 bg-surface">
              <h3 className="font-display font-bold text-2xl text-foreground mb-6 border-b border-outline pb-4">Project Requirements</h3>
              <ul className="space-y-4 text-foreground/80 list-disc list-inside">
                <li>Strong foundation in core departmental subjects.</li>
                <li>Commitment of 10-15 hours per week.</li>
                <li>Prior experience in relevant technical stacks preferred.</li>
                <li>Excellent analytical and communication skills.</li>
              </ul>
            </div>

            <div className="border border-outline p-8 bg-surface">
              <h3 className="font-display font-bold text-2xl text-foreground mb-6 border-b border-outline pb-4">Timeline & Attachments</h3>
              <div className="flex items-center gap-4 text-foreground/80 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Posted on {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-4 text-foreground/80 mb-6">
                <FileText className="w-5 h-5 text-primary" />
                <Link href="#" className="hover:underline text-primary">Project_Brief_Detailed.pdf</Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Action Card */}
            <div className="bg-secondary p-8 rounded-xl text-center shadow-xl border border-outline">
              <h3 className="text-foreground font-bold text-xl mb-4">Ready to Apply?</h3>
              <p className="text-foreground/70 text-sm mb-6">Submit your resume and statement of purpose directly to the principal investigator.</p>
              {user ? (
                 <ApplyProjectButton projectId={project.id} maxStudents={project.max_students} isClosed={project.status !== 'open'} />
              ) : (
                <Link href="/login" className="block w-full bg-primary text-on-primary py-4 font-bold uppercase tracking-widest text-sm rounded hover:brightness-110 transition-colors">
                  Log in to Apply
                </Link>
              )}
            </div>

            {/* Mentor Card */}
            <div className="border border-outline p-6 bg-surface">
              <h4 className="font-bold text-xs text-foreground/50 tracking-widest uppercase mb-4">Principal Investigator</h4>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-outline flex items-center justify-center text-primary font-bold text-xl">
                  {project.portal_users?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">{project.portal_users?.name || 'Dr. Unknown'}</h4>
                  <p className="text-sm text-foreground/70">{project.department} Dept</p>
                </div>
              </div>
              <Link href={`/profile/${project.portal_users?.id}`} className="block mt-6 text-center border border-primary text-primary py-2 font-bold uppercase tracking-widest text-xs rounded hover:bg-primary/5 transition-colors">
                View Full Profile
              </Link>
            </div>

            {/* Related Projects */}
            {relatedProjects && relatedProjects.length > 0 && (
              <div className="border border-outline p-6 bg-surface">
                <h4 className="font-bold text-xs text-foreground/50 tracking-widest uppercase mb-4 border-b border-outline pb-2">Related Projects</h4>
                <div className="space-y-4 pt-2">
                  {relatedProjects.map((rp: any) => (
                    <div key={rp.id}>
                      <Link href={`/projects/${rp.id}`} className="block group">
                        <h5 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{rp.title}</h5>
                        <p className="text-xs text-foreground/70 mt-1">{rp.portal_users?.name}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
