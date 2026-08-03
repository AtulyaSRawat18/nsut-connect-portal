"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const newsSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  sourceUrl: z.string().url("A valid source URL is required").refine((value) => value.startsWith("https://"), "Use an HTTPS source URL"),
});

type NewsFormValues = z.infer<typeof newsSchema>;

export default function NewNewsPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      category: "general"
    }
  });

  const onSubmit = async (data: NewsFormValues) => {
    const response = await fetch("/api/faculty/news", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(result.message || "News publishing failed.");
    } else {
      alert("News published successfully!");
      router.push("/news");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-widest mb-8 hover:underline">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-4xl font-display font-black text-primary mb-2 tracking-tight">Post Announcement</h1>
        <p className="text-foreground/50 mb-12">Publish departmental news, research updates, or general announcements.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-surface p-8 border border-outline rounded-xl">
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Notice Title</label>
            <input
              type="text"
              className={`w-full px-4 py-3 bg-background border ${errors.title ? "border-red-500" : "border-outline"} text-foreground focus:border-primary outline-none transition-all`}
              placeholder="e.g. Call for Papers: TechConf 2024"
              {...register("title")}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Content</label>
            <textarea
              className={`w-full px-4 py-3 bg-background border ${errors.content ? "border-red-500" : "border-outline"} text-foreground focus:border-primary outline-none transition-all min-h-[150px]`}
              placeholder="Detail the announcement..."
              {...register("content")}
            />
            {errors.content && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.content.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Primary source link <span className="text-primary">(required)</span></label>
            <input
              type="url"
              className={`w-full px-4 py-3 bg-background border ${errors.sourceUrl ? "border-red-500" : "border-outline"} text-foreground focus:border-primary outline-none transition-all`}
              placeholder="https://official-source.example/research-update"
              {...register("sourceUrl")}
            />
            <p className="mt-2 text-xs text-foreground/45">Every news item must link to the official or primary source used for the summary.</p>
            {errors.sourceUrl && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.sourceUrl.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Category</label>
            <select
              className={`w-full px-4 py-3 bg-background border ${errors.category ? "border-red-500" : "border-outline"} text-foreground focus:border-primary outline-none transition-all`}
              {...register("category")}
            >
              <option value="general">General</option>
              <option value="research">Research Update</option>
              <option value="academic">Academic Notice</option>
              <option value="event">Event Announcement</option>
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.category.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground py-4 text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin w-4 h-4" /> Publishing...</>
            ) : "Publish Announcement"}
          </button>
        </form>
      </div>
    </div>
  );
}
