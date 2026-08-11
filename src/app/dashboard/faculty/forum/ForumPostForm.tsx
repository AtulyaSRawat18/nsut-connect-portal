"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { DEPARTMENTS, getDepartmentLabel } from "@/lib/departments";

export default function ForumPostForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/forum/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(form.get("title") || ""),
        content: String(form.get("content") || ""),
        department: String(form.get("department") || ""),
      }),
    });
    const result = await response.json().catch(() => null);

    setSubmitting(false);
    if (!response.ok) {
      setMessage(result?.message || "The post could not be published.");
      return;
    }

    event.currentTarget.reset();
    setMessage("Discussion published.");
    router.refresh();
  }

  return (
    <form onSubmit={submitPost} className="space-y-5 rounded-2xl border border-outline bg-surface p-6">
      <div>
        <h2 className="text-xl font-black text-foreground">Start a discussion</h2>
        <p className="mt-1 text-sm text-foreground/50">Publish as your verified faculty identity.</p>
      </div>

      <label className="block">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-foreground/55">Title</span>
        <input
          name="title"
          required
          minLength={8}
          maxLength={180}
          className="w-full rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          placeholder="What would you like the community to discuss?"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-foreground/55">Department</span>
        <select
          name="department"
          required
          defaultValue=""
          className="w-full rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        >
          <option value="" disabled>Select a department</option>
          {DEPARTMENTS.map((department) => <option key={department.id} value={department.id}>{getDepartmentLabel(department.id)}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-foreground/55">Discussion</span>
        <textarea
          name="content"
          required
          minLength={30}
          maxLength={5000}
          rows={7}
          className="w-full resize-y rounded-lg border border-outline bg-background px-4 py-3 text-sm leading-relaxed outline-none focus:border-primary"
          placeholder="Share context, resources, and a clear question for students and colleagues."
        />
      </label>

      {message && <p role="status" className="text-sm font-semibold text-foreground/65">{message}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Publish discussion
      </button>
    </form>
  );
}
