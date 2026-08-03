"use client";

import { useState } from "react";
import { Loader2, Megaphone, Rocket } from "lucide-react";

type Publisher = "announcement" | "opportunity";

export default function AdminContentPublisher() {
  const [active, setActive] = useState<Publisher>("announcement");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const publish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const announcement = active === "announcement";
    const payload = announcement ? {
      title: form.get("title"), content: form.get("body"), category: form.get("category"), sourceUrl: form.get("link"),
    } : {
      title: form.get("title"), description: form.get("body"), type: form.get("type"), linkUrl: form.get("link"), deadline: form.get("deadline"),
    };
    try {
      const response = await fetch(announcement ? "/api/faculty/news" : "/api/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = (await response.json()) as { message?: string };
      setMessage(response.ok ? `${announcement ? "Announcement" : "Opportunity"} published.` : body.message || "Unable to publish");
      if (response.ok) event.currentTarget.reset();
    } catch {
      setMessage("Publishing is temporarily unavailable");
    } finally {
      setBusy(false);
    }
  };

  return <section className="rounded-2xl border border-outline bg-surface p-6 md:p-8">
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h2 className="text-xl font-black text-foreground">Basic content management</h2><p className="mt-1 text-sm text-foreground/50">Publish attributed announcements and opportunities. Every item requires a destination or source link.</p></div><div className="flex rounded-xl border border-outline bg-background p-1">{([{ key: "announcement" as const, label: "Announcement", icon: Megaphone }, { key: "opportunity" as const, label: "Opportunity", icon: Rocket }]).map((item) => { const Icon = item.icon; return <button key={item.key} type="button" onClick={() => { setActive(item.key); setMessage(""); }} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold ${active === item.key ? "bg-primary text-on-primary" : "text-foreground/55"}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</div></div>
    <form key={active} onSubmit={publish} className="grid gap-4 md:grid-cols-2">
      <input name="title" required minLength={5} maxLength={180} placeholder={`${active === "announcement" ? "Announcement" : "Opportunity"} title`} className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary md:col-span-2" />
      <textarea name="body" required minLength={20} maxLength={8000} placeholder="Clear public description" className="h-28 resize-y rounded-lg border border-outline bg-background p-4 text-sm outline-none focus:border-primary md:col-span-2" />
      {active === "announcement" ? <input name="category" required placeholder="Category, e.g. research" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary" /> : <select name="type" required className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary"><option value="internship">Internship</option><option value="scholarship">Scholarship</option><option value="event">Event</option><option value="highlight">Highlight</option></select>}
      {active === "opportunity" && <input name="deadline" type="date" required className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary" />}
      <input name="link" type="url" required placeholder="https:// verified source or action link" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary md:col-span-2" />
      {message && <p role="status" className="text-sm font-bold text-primary md:col-span-2">{message}</p>}
      <button disabled={busy} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-50 md:col-span-2">{busy && <Loader2 className="h-4 w-4 animate-spin" />}Publish {active}</button>
    </form>
  </section>;
}
