"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ExternalLink, FileCheck2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ResearchBackdrop from "@/components/shared/ResearchBackdrop";
import { DEPARTMENTS, getDepartmentLabel, isDepartmentId } from "@/lib/departments";
import { isApplicationFormReference } from "@/lib/application-forms";

const projectSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(180),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(8000),
  department: z.string().refine(isDepartmentId, "Select a valid department"),
  maxStudents: z.number().int().min(1, "At least 1 student is required").max(50, "Capacity cannot exceed 50"),
  briefUrl: z.string().trim().min(1, "Add a reference or enter NA").max(700),
  applicationFormUrl: z.string().trim().min(1, "Add a Google Form, demo form, or enter NA").max(700).refine(isApplicationFormReference, "Use a Google Forms URL, an approved /demo-forms/ path, or NA"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { maxStudents: 1, briefUrl: "NA", applicationFormUrl: "NA" },
  });

  async function onSubmit(data: ProjectFormValues) {
    const response = await fetch("/api/faculty/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      window.alert(result.message || "Project publishing failed.");
      return;
    }
    router.push("/dashboard/faculty/projects");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbf7ef] px-6 py-12 dark:bg-background">
      <ResearchBackdrop compact />
      <div className="relative mx-auto max-w-3xl">
        <Link href="/dashboard/faculty/projects" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:underline"><ArrowLeft size={16} /> Back to projects</Link>
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">Research workspace</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground">List a research project</h1>
          <p className="mt-3 text-foreground/55">Define the work clearly enough for students to assess it before applying.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7 rounded-2xl border border-outline bg-surface/95 p-6 shadow-sm backdrop-blur-sm md:p-8">
          <div>
            <label htmlFor="project-title" className="mb-2 block text-xs font-bold uppercase tracking-widest text-foreground">Project title</label>
            <input id="project-title" className={`w-full border bg-background px-4 py-3 text-foreground outline-none transition-all focus:border-primary ${errors.title ? "border-red-500" : "border-outline"}`} placeholder="e.g. Low-power sensing for urban heat mapping" {...register("title")} />
            {errors.title && <p className="mt-1 text-xs font-semibold text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="project-description" className="mb-2 block text-xs font-bold uppercase tracking-widest text-foreground">Detailed description</label>
            <textarea id="project-description" className={`min-h-40 w-full border bg-background px-4 py-3 text-foreground outline-none transition-all focus:border-primary ${errors.description ? "border-red-500" : "border-outline"}`} placeholder="Explain the problem, method, student contribution, expected outcomes, prerequisites and responsible-use limits." {...register("description")} />
            {errors.description && <p className="mt-1 text-xs font-semibold text-red-500">{errors.description.message}</p>}
          </div>

          <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
            <div className="flex items-start gap-3"><FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><label htmlFor="project-brief" className="block text-xs font-bold uppercase tracking-widest text-foreground">Project material / reference</label><p className="mt-1 text-xs leading-5 text-foreground/55">Add a Drive, Docs, Word, PDF, or portal link; you may also enter descriptive text or NA when no material is assigned.</p></div></div>
            <input id="project-brief" type="text" className={`mt-4 w-full border bg-background px-4 py-3 text-foreground outline-none transition-all focus:border-primary ${errors.briefUrl ? "border-red-500" : "border-outline"}`} placeholder="Drive/Docs/Word/PDF link, notes, or NA" {...register("briefUrl")} />
            {errors.briefUrl && <p className="mt-1 text-xs font-semibold text-red-500">{errors.briefUrl.message}</p>}
          </div>

          <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 p-5">
            <div className="flex items-start gap-3"><ExternalLink className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /><div><label htmlFor="project-application-form" className="block text-xs font-bold uppercase tracking-widest text-foreground">Application questionnaire</label><p className="mt-1 text-xs leading-5 text-foreground/55">Paste the published Google Forms URL students must complete before applying. Use NA if this project has no questionnaire; approved local demo paths are supported in staging.</p></div></div>
            <input id="project-application-form" type="text" className={`mt-4 w-full border bg-background px-4 py-3 text-foreground outline-none transition-all focus:border-primary ${errors.applicationFormUrl ? "border-red-500" : "border-outline"}`} placeholder="https://forms.gle/... or NA" {...register("applicationFormUrl")} />
            {errors.applicationFormUrl && <p className="mt-1 text-xs font-semibold text-red-500">{errors.applicationFormUrl.message}</p>}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="project-department" className="mb-2 block text-xs font-bold uppercase tracking-widest text-foreground">Primary department</label>
              <select id="project-department" defaultValue="" className={`w-full border bg-background px-4 py-3 text-foreground outline-none focus:border-primary ${errors.department ? "border-red-500" : "border-outline"}`} {...register("department")}><option value="" disabled>Select department</option>{DEPARTMENTS.map((department) => <option key={department.id} value={department.id}>{getDepartmentLabel(department.id)}</option>)}</select>
              {errors.department && <p className="mt-1 text-xs font-semibold text-red-500">{errors.department.message}</p>}
            </div>
            <div>
              <label htmlFor="project-capacity" className="mb-2 block text-xs font-bold uppercase tracking-widest text-foreground">Student capacity</label>
              <input id="project-capacity" type="number" min={1} max={50} className={`w-full border bg-background px-4 py-3 text-foreground outline-none focus:border-primary ${errors.maxStudents ? "border-red-500" : "border-outline"}`} {...register("maxStudents", { valueAsNumber: true })} />
              {errors.maxStudents && <p className="mt-1 text-xs font-semibold text-red-500">{errors.maxStudents.message}</p>}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 bg-primary py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50">{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing project…</> : "Publish project"}</button>
        </form>
      </div>
    </div>
  );
}
