import Link from "next/link";
import { ArrowLeft, FileText, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ApplyProjectButton } from "@/components/projects/ApplyProjectButton";
import { getShowcaseProject } from "@/content/showcase";
import { getDepartmentCompactLabel, getDepartmentLabel } from "@/lib/departments";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const brief = getShowcaseProject(id);

  // Fetch project details
  const { data: project } = await supabase
    .from("projects")
    .select("*, profiles!projects_faculty_id_fkey(id, full_name, role)")
    .eq("id", id)
    .single();

  if (!project) notFound();
  const briefUrl = project.brief_url || brief?.pdf || null;
  const linkedBrief = Boolean(briefUrl && (briefUrl.startsWith("https://") || briefUrl.startsWith("/")));

  // Fetch related projects (same department, excluding current)
  const { data: relatedProjects } = await supabase
    .from("projects")
    .select("id, title, department, profiles!projects_faculty_id_fkey(full_name)")
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
                  {getDepartmentCompactLabel(project.department)}
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
              <div className="mt-7 rounded-xl border border-outline bg-surface p-5">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest"><span>Verified project progress</span><span>{project.progress_percent || 0}% ? {(project.health_status || "on_track").replace("_", " ")}</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-foreground/10"><div className="h-full bg-primary" style={{ width: (project.progress_percent || 0) + "%" }} /></div>
                {project.progress_note && <p className="mt-4 text-sm leading-6 text-foreground/60">{project.progress_note}</p>}
              </div>

            <div className="border border-outline p-8 bg-surface">
              <h3 className="font-display font-bold text-2xl text-foreground mb-6 border-b border-outline pb-4">Research plan</h3>
              <p className="leading-7 text-foreground/75">{brief?.problem || "The faculty lead will share the validated problem statement with shortlisted applicants."}</p>
              {brief && <><h4 className="mt-7 font-black text-foreground">Method</h4><p className="mt-2 leading-7 text-foreground/70">{brief.method}</p><h4 className="mt-7 font-black text-foreground">Objectives</h4><ul className="mt-3 list-disc space-y-3 pl-5 text-foreground/70">{brief.objectives.map((item) => <li key={item}>{item}</li>)}</ul></>}
            </div>

            {brief && <div className="grid gap-6 md:grid-cols-2"><section className="border border-outline bg-surface p-7"><h3 className="text-xl font-black">Skills</h3><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-foreground/70">{brief.skills.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="border border-outline bg-surface p-7"><h3 className="text-xl font-black">Deliverables</h3><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-foreground/70">{brief.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></section></div>}

            <div className="border border-outline p-8 bg-surface">
              <h3 className="font-display font-bold text-2xl text-foreground mb-6 border-b border-outline pb-4">Timeline & Attachments</h3>
              <div className="flex items-center gap-4 text-foreground/80 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Posted on {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              {linkedBrief ? <div className="mb-6 flex items-center gap-4 text-foreground/80"><FileText className="h-5 w-5 text-primary" /><a href={briefUrl!} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline">Open project material</a></div> : <div className="mb-6 rounded border border-outline bg-background p-4 text-sm text-foreground/65"><strong className="text-foreground">Project material:</strong> {briefUrl || "NA"}</div>}
              {brief && <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-foreground/65">{brief.timeline.map((item) => <li key={item}>{item}</li>)}</ol>}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Action Card */}
            <div className="bg-secondary p-8 rounded-xl text-center shadow-xl border border-outline">
              <h3 className="text-foreground font-bold text-xl mb-4">Ready to Apply?</h3>
              <p className="text-foreground/70 text-sm mb-6">Submit your resume and statement of purpose directly to the principal investigator.</p>
              {user ? (
                 <ApplyProjectButton projectId={project.id} availableSeats={project.available_seats ?? project.max_students} isClosed={project.status !== 'open' || (project.available_seats ?? project.max_students) <= 0} />
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
                  {project.profiles?.full_name?.charAt(0) || 'D'}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">{project.profiles?.full_name || 'Dr. Unknown'}</h4>
                  <p className="text-sm text-foreground/70">{getDepartmentLabel(project.department)}</p>
                </div>
              </div>
              <Link href={`/profile/${project.profiles?.id}`} className="block mt-6 text-center border border-primary text-primary py-2 font-bold uppercase tracking-widest text-xs rounded hover:bg-primary/5 transition-colors">
                View Full Profile
              </Link>
            </div>

            {/* Related Projects */}
            {relatedProjects && relatedProjects.length > 0 && (
              <div className="border border-outline p-6 bg-surface">
                <h4 className="font-bold text-xs text-foreground/50 tracking-widest uppercase mb-4 border-b border-outline pb-2">Related Projects</h4>
                <div className="space-y-4 pt-2">
                  {relatedProjects.map((rp) => (
                    <div key={rp.id}>
                      <Link href={`/projects/${rp.id}`} className="block group">
                        <h5 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{rp.title}</h5>
                        <p className="text-xs text-foreground/70 mt-1">{rp.profiles?.[0]?.full_name}</p>
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
