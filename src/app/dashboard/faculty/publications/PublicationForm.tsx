"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

export default function PublicationForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/faculty/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          authors: String(form.get("authors") || "").split(",").map((author) => author.trim()).filter(Boolean),
          publishedDate: form.get("publishedDate") || undefined,
          url: form.get("url") || undefined,
        }),
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(body.message || "Unable to add publication");
        return;
      }
      event.currentTarget.reset();
      router.refresh();
    } catch {
      setError("Publication service is unavailable");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-outline bg-surface p-6">
      <h2 className="mb-5 text-lg font-black text-foreground">Add publication</h2>
      <div className="space-y-4">
        <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/50">Title</span><input name="title" required minLength={5} className="w-full rounded-xl border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary" /></label>
        <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/50">Authors</span><input name="authors" required placeholder="Separate names with commas" className="w-full rounded-xl border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/50">Published date</span><input name="publishedDate" type="date" className="w-full rounded-xl border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary" /></label>
          <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground/50">Paper URL</span><input name="url" type="url" placeholder="https://doi.org/..." className="w-full rounded-xl border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary" /></label>
        </div>
      </div>
      {error && <p className="mt-4 text-sm font-semibold text-red-500">{error}</p>}
      <button disabled={busy} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add publication
      </button>
    </form>
  );
}
