"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Calendar, Loader2, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import PageHeading from "@/components/shared/PageHeading";

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
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams({ topic });
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        const response = await fetch(`/api/feed?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Feed unavailable");
        const data = await response.json();
        setFeedItems(data.feedItems || []);
      } catch {
        if (!controller.signal.aborted) { setError(true); setFeedItems([]); }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [topic, searchQuery, retry]);

  return (
    <div className="portal-page">
      <div className="portal-container">
        <PageHeading eyebrow="Follow your curiosity" title="Science & engineering feed" description="Fresh perspectives on research and technology, grounded in primary and official sources." />

        <section className="portal-filter-bar">
          <label className="relative block"><Search className="absolute left-4 top-3.5 h-5 w-5 text-foreground/40" /><input type="search" aria-label="Search research feed" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search autonomous docking, biomanufacturing, climate roads..." className="w-full rounded-md border border-outline bg-background py-3 pl-12 pr-4 text-sm outline-none focus:border-primary" /></label>
          <div className="portal-topic-tabs" role="group" aria-label="Research topics">{topics.map((item) => <button key={item.value} aria-pressed={topic === item.value} onClick={() => setTopic(item.value)}>{item.label}</button>)}</div>
        </section>

        {error && <div role="alert" className="portal-notice"><p>The research feed is temporarily unavailable.</p><button onClick={() => setRetry(value => value + 1)}><RefreshCw size={16} /> Try again</button></div>}

        {error ? null : loading ? <div className="flex justify-center py-24" role="status" aria-label="Loading research feed"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : feedItems.length === 0 ? <div className="rounded-lg border border-dashed border-outline py-20 text-center text-sm text-foreground/50">No research briefs match this topic and search.</div> : <div className="lazy-card-list space-y-6">{feedItems.map((item) => <article key={item.id} className="group border border-outline bg-surface p-8 md:p-10"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold normal-case tracking-normal text-primary">{item.topic.replace("-", " & ")}</span><span className="flex items-center gap-2 text-xs font-bold normal-case tracking-normal text-foreground/45"><Calendar className="h-3.5 w-3.5" /> {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div><h2 className="text-2xl font-semibold leading-tight transition-colors group-hover:text-primary md:text-3xl">{item.title}</h2><p className="mt-4 text-base leading-relaxed text-foreground/65">{item.description}</p><div className="mt-7 border-t border-outline pt-5"><Link href={`/news/${item.id}`} className="inline-flex items-center gap-2 text-xs font-semibold normal-case tracking-normal text-primary">Read evidence brief <ArrowRight className="h-4 w-4" /></Link></div></article>)}</div>}
      </div>
    </div>
  );
}
