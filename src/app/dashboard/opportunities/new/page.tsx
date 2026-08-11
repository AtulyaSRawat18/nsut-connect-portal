"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DEPARTMENTS, getDepartmentLabel, isDepartmentId } from "@/lib/departments";

const opportunitySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.enum(["internship", "scholarship", "event", "highlight"]),
  link_url: z.string().min(1, "An application or source link is required").refine((value) => value.startsWith("https://") || value.startsWith("/"), "Use an HTTPS or site-local link"),
  deadline: z.string().min(1, "Deadline date is required"),
  department: z.string().refine(isDepartmentId, "Department is required"),
});

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

export default function NewOpportunityPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user is faculty or content handler
      const { data: profile } = await supabase
        .from("portal_users")
        .select("role, is_content_handler")
        .eq("id", user.id)
        .single();

      if (profile && (profile.role === "faculty" || profile.is_content_handler)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      setLoadingAuth(false);
    }
    checkAuth();
  }, [router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      type: "internship",
      link_url: "",
    }
  });

  const onSubmit = async (data: OpportunityFormValues) => {
    const response = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...data, linkUrl: data.link_url }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(result.message || "Opportunity publishing failed.");
    } else {
      alert("Opportunity posted successfully!");
      router.push("/opportunities");
      router.refresh();
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-display font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-foreground/50 max-w-md mb-8">You do not have permission to post opportunities. Only designated Content Handlers and Faculty members can post here.</p>
        <Link href="/dashboard" className="border border-outline px-6 py-3 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-surface transition-colors">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-widest mb-8 hover:underline">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase mb-4 w-fit">
          <Sparkles className="w-3.5 h-3.5 fill-primary" /> Content Handler
        </div>
        <h1 className="text-4xl font-display font-black text-primary mb-2 tracking-tight">Post Opportunity</h1>
        <p className="text-foreground/50 mb-12">Publish scholarships, research internships, hackathons, or student developments.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-surface p-8 border border-outline rounded-xl">
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Title</label>
            <input
              type="text"
              className={`w-full px-4 py-3 bg-background border ${errors.title ? "border-red-500" : "border-outline"} text-foreground focus:border-primary outline-none transition-all`}
              placeholder="e.g. summer internship in Deep Learning"
              {...register("title")}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Description</label>
            <textarea
              className={`w-full px-4 py-3 bg-background border ${errors.description ? "border-red-500" : "border-outline"} text-foreground focus:border-primary outline-none transition-all min-h-[150px]`}
              placeholder="Provide eligibility, stipend/awards, and work details..."
              {...register("description")}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Type</label>
              <select
                className="w-full px-4 py-3 bg-background border border-outline text-foreground focus:border-primary outline-none transition-all"
                {...register("type")}
              >
                <option value="internship">Internship</option>
                <option value="scholarship">Scholarship</option>
                <option value="event">Event / Hackathon</option>
                <option value="highlight">Spotlight Highlight</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Apply or source URL <span className="text-primary">(required)</span></label>
              <input
                type="text"
                className={`w-full px-4 py-3 bg-background border ${errors.link_url ? "border-red-500" : "border-outline"} text-foreground focus:border-primary outline-none transition-all`}
                placeholder="https://google.com/careers or similar"
                {...register("link_url")}
              />
              {errors.link_url && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.link_url.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Application Deadline</label>
            <input
              type="date"
              className={`w-full px-4 py-3 bg-background border ${errors.deadline ? "border-red-500" : "border-outline"} text-foreground focus:border-primary outline-none transition-all`}
              {...register("deadline")}
            />
            {errors.deadline && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.deadline.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Department</label>
            <select className={`w-full px-4 py-3 bg-background border ${errors.department ? "border-red-500" : "border-outline"} text-foreground focus:border-primary outline-none transition-all`} defaultValue="" {...register("department")}>
              <option value="" disabled>Select department</option>
              {DEPARTMENTS.map((department) => <option key={department.id} value={department.id}>{getDepartmentLabel(department.id)}</option>)}
            </select>
            {errors.department && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.department.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground py-4 text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin w-4 h-4" /> Publishing...</>
            ) : "Publish Opportunity"}
          </button>
        </form>
      </div>
    </div>
  );
}
