"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  department: z.enum(['CSE', 'ECE', 'IT', 'MAC', 'ICE', 'MECH', 'CIVIL', 'BT', 'BBA']),
  maxStudents: z.number().min(1, "At least 1 student required"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      maxStudents: 1,
    }
  });

  const onSubmit = async (data: ProjectFormValues) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from('projects').insert({
      title: data.title,
      description: data.description,
      department: data.department,
      faculty_id: user.id,
      max_students: data.maxStudents,
      status: 'open'
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Project listed successfully!");
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-widest mb-8 hover:underline">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-4xl font-display font-black text-primary mb-2 tracking-tight">List New Research Project</h1>
        <p className="text-foreground/50 mb-12">Attract top students to join your research initiatives.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-surface p-8 border border-outline rounded-xl">
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Project Title</label>
            <input
              type="text"
              className={`w-full px-4 py-3 bg-background border ${errors.title ? "border-red-500" : "border-outline"} text-foreground focus:border-primary outline-none transition-all`}
              placeholder="e.g. Advancements in Edge Computing for IoT"
              {...register("title")}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Detailed Description</label>
            <textarea
              className={`w-full px-4 py-3 bg-background border ${errors.description ? "border-red-500" : "border-outline"} text-foreground focus:border-primary outline-none transition-all min-h-[150px]`}
              placeholder="Outline the research goals, required skillsets, and expected outcomes..."
              {...register("description")}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Primary Department</label>
              <select
                className={`w-full px-4 py-3 bg-background border ${errors.department ? "border-red-500" : "border-outline"} text-foreground focus:border-primary outline-none transition-all`}
                {...register("department")}
              >
                <option value="">Select Dept</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="IT">IT</option>
                <option value="MAC">MAC</option>
                <option value="ICE">ICE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="BT">BT</option>
                <option value="BBA">BBA</option>
              </select>
              {errors.department && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.department.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Max Students</label>
              <input
                type="number"
                className={`w-full px-4 py-3 bg-background border ${errors.maxStudents ? "border-red-500" : "border-outline"} text-foreground focus:border-primary outline-none transition-all`}
                {...register("maxStudents", { valueAsNumber: true })}
              />
              {errors.maxStudents && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.maxStudents.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground py-4 text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin w-4 h-4" /> Listing Project...</>
            ) : "Publish Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
