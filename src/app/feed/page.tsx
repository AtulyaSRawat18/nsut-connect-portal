"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Calendar, Loader2, Microscope, Search } from "lucide-react";
import Link from "next/link";

interface FeedItem {
  id: string;
  type: "research";
  title: string;
  description: string;
  date: string;
  topic: string;
}

const topics = [
  { value: "all", label: "All topics" },
  { value: "space", label: "Space" },
  { value: "ai-robotics", label: "AI & Robotics" },
  { value: "biotech", label: "Biotech" },
  { value: "civil-climate", label: "Civil & Climate" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "energy", label: "Energy" },
];

export default function FeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ topic });
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        const response = await fetch(`/api/feed?${params.toString()}`, { signal: controller.signal });
        const data = await response.json();
        setFeedItems(data.feedItems || []);
      } catch (error) {
        if (!controller.signal.aborted) console.error("Failed to load research feed", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [topic, searchQuery]);

  return (
    <div className="min-h-screen bg-background py-16 text-foreground">
      <div className="mx-auto max-w-5xl px-6">
        <header className="mb-12 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary"><Microscope className="h-3.5 w-3.5" /> Curated research intelligence</div>
          <h1 className="text-5xl font-black tracking-tight">Science & Engineering Feed</h1>
          <p className="mt-4 text-lg leading-relaxed text-foreground/60">Focused briefs on research and technology developments, written from primary or official sources. Campus notices, project advertisements and generic opportunities are intentionally excluded.</p>
        </header>

        <section className="mb-10 space-y-4 rounded-2xl border border-outline bg-surface p-5">
          <label className="relative block"><Search className="absolute left-4 top-3.5 h-5 w-5 text-foreground/40" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search autonomous docking, biomanufacturing, climate roads..." className="w-full border border-outline bg-background py-3 pl-12 pr-4 text-sm outline-none focus:border-primary" /></label>
          <div className="flex flex-wrap gap-2" aria-label="Research topics">{topics.map((item) => <button key={item.value} onClick={() => setTopic(item.value)} className={`border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${topic === item.value ? "border-foreground bg-foreground text-background" : "border-outline bg-background text-foreground/60 hover:border-primary hover:text-primary"}`}>{item.label}</button>)}</div>
        </section>

        {loading ? <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : feedItems.length === 0 ? <div className="rounded-2xl border border-dashed border-outline py-20 text-center text-sm text-foreground/50">No research briefs match this topic and search.</div> : <div className="space-y-6">{feedItems.map((item) => <article key={item.id} className="group border border-outline bg-surface p-8 md:p-10"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-primary/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-primary">{item.topic.replace("-", " & ")}</span><span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/45"><Calendar className="h-3.5 w-3.5" /> {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div><h2 className="text-2xl font-black leading-tight transition-colors group-hover:text-primary md:text-3xl">{item.title}</h2><p className="mt-4 text-base leading-relaxed text-foreground/65">{item.description}</p><div className="mt-7 border-t border-outline pt-5"><Link href={`/news/${item.id}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">Read evidence brief <ArrowRight className="h-4 w-4" /></Link></div></article>)}</div>}
      </div>
    </div>
  );
}