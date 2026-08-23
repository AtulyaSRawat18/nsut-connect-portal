import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import ProjectEditForm from "./ProjectEditForm";

export default async function EditFacultyProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const identity = await requirePageIdentity({ permissions: ["project.update.own"] });
  const { id } = await params;
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select("id, title, description, department, status, max_students, available_seats, brief_url, application_form_url, progress_percent, health_status, progress_note")
    .eq("id", id)
    .eq("faculty_id", identity.id)
    .maybeSingle();

  if (error) {
    return <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-10 text-red-700"><h1 className="text-xl font-black">Project editor unavailable</h1><p className="mt-2 text-sm">The project could not be loaded. Please retry shortly.</p></div>;
  }
  if (!project) notFound();

  return (
    <div className="space-y-8">
      <header>
        <Link href="/dashboard/faculty/projects" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to projects</Link>
        <p className="mt-7 text-xs font-black uppercase tracking-[0.3em] text-primary">Owner-only project editor</p>
        <h1 className="mt-2 text-4xl font-black text-foreground">Edit project listing</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground/55">Update the public description, capacity, project PDF or material, application questionnaire, and current research assessment.</p>
      </header>
      <ProjectEditForm project={project} />
    </div>
  );
}
