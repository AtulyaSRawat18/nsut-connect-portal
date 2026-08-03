"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Microscope } from "lucide-react";
import Link from "next/link";

interface FeedItem { id: string; type: "research"; title: string; description: string; date: string; topic: string }

const topics = [
  ["all", "All"], ["space", "Space"], ["biotech", "Biotech"],
  ["civil-climate", "Civil"], ["entrepreneurship", "Startups"]
] as const;

export default function StudentFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState("all");

  useEffect(() => {
    const controller = new AbortController();
    async function loadFeed() {
      setLoading(true);
      try {
        const response = await fetch(`/api/feed?topic=${topic}`, { signal: controller.signal });
        const data = await response.json();
        setFeedItems(data.feedItems || []);
      } catch (error) {
        if (!controller.signal.aborted) console.error("Failed to load dashboard research feed", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadFeed();
    return () => controller.abort();
  }, [topic]);

  return (
    <section className="mt-12 space-y-8 border-t border-outline/50 pt-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div><h2 className="flex items-center gap-2 text-2xl font-black tracking-tight"><Microscope className="h-5 w-5 text-primary" /> Research intelligence</h2><p className="mt-1 text-sm text-foreground/50">Curated science and engineering developments—not campus notices.</p></div>
        <div className="flex flex-wrap gap-2">{topics.map(([value, label]) => <button key={value} onClick={() => setTopic(value)} className={`border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${topic === value ? "border-foreground bg-foreground text-background" : "border-outline text-foreground/55"}`}>{label}</button>)}</div>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : feedItems.length === 0 ? <div className="border border-dashed border-outline py-12 text-center text-xs text-foreground/50">No briefs match this topic.</div> : <div className="grid gap-6 md:grid-cols-2">{feedItems.slice(0, 4).map((item) => <article key={item.id} className="flex flex-col justify-between border border-outline bg-surface p-6"><div><div className="flex items-center justify-between gap-4"><span className="text-[9px] font-black uppercase tracking-widest text-primary">{item.topic.replace("-", " & ")}</span><span className="text-[9px] font-bold text-foreground/40">{new Date(item.date).toLocaleDateString("en-IN")}</span></div><h3 className="mt-4 text-lg font-black leading-snug">{item.title}</h3><p className="mt-3 line-clamp-3 text-xs leading-relaxed text-foreground/55">{item.description}</p></div><Link href={`/news/${item.id}`} className="mt-5 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary">Read brief <ArrowRight className="h-3 w-3" /></Link></article>)}</div>}
      <div className="text-center"><Link href="/feed" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">Open complete research feed <ArrowRight className="h-4 w-4" /></Link></div>
    </section>
  );
}