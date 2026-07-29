"use client";

import { useEffect, useState } from "react";
import {
  Sparkles, Calendar, ArrowRight, Bell, Projector, Briefcase,
  Search, SlidersHorizontal, Loader2, Bookmark, Share2, Award
} from "lucide-react";
import Link from "next/link";

interface FeedItem {
  id: string;
  type: "news" | "project" | "opportunity";
  title: string;
  description: string;
  date: string;
  department: string;
  category?: string;
  opportunityType?: string;
  linkUrl?: string;
  deadline?: string;
}

export default function FeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [personalized, setPersonalized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDept, setUserDept] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      try {
        const res = await fetch(`/api/feed?filter=${filter}&personalized=${personalized}`);
        const data = await res.json();
        setFeedItems(data.feedItems || []);
        setUserDept(data.userDept || null);
      } catch (err) {
        console.error("Failed to load feed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, [filter, personalized]);

  const filteredItems = feedItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-16 font-sans">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 fill-primary animate-pulse" /> Knowledge Sphere
            </div>
            <h1 className="text-4xl font-display font-black tracking-tight mb-2 text-foreground">Academic Feed</h1>
            <p className="text-foreground/50 font-medium">Consolidated, AI-curated updates, opportunities, and projects across NSUT.</p>
          </div>

          {userDept && (
            <button
              onClick={() => setPersonalized(!personalized)}
              className={`flex items-center gap-2 px-4 py-3 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${
                personalized
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-surface text-foreground border-outline hover:border-primary"
              }`}
            >
              <SlidersHorizontal size={14} />
              {personalized ? `Prioritizing ${userDept}` : "Personalize Feed"}
            </button>
          )}
        </header>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center bg-surface border border-outline p-4 rounded-xl">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              placeholder="Search feed, topics, tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-outline text-sm outline-none focus:border-primary transition-all text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {["all", "news", "projects", "opportunities"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all border ${
                  filter === tab
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground/60 border-outline hover:border-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Content */}
        {loading ? (
          <div className="py-24 flex justify-center items-center">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-24 border border-dashed border-outline rounded-2xl text-center">
            <p className="text-foreground/50 text-sm font-semibold italic">No items found matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-surface border border-outline p-8 transition-all hover:border-primary hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                        item.type === "news" ? "bg-red-500/10 text-red-500" :
                        item.type === "project" ? "bg-green-500/10 text-green-500" :
                        "bg-blue-500/10 text-blue-500"
                      }`}>
                        {item.type}
                      </span>
                      {item.category && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                          • {item.category}
                        </span>
                      )}
                      {item.opportunityType && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                          • {item.opportunityType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                      <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-foreground/60 text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-outline/50 mt-auto">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary/75 bg-primary/5 px-3 py-1.5 rounded-full">
                    🏷️ {item.department}
                  </div>

                  <div className="flex items-center gap-4">
                    {item.type === "project" && (
                      <Link href={`/projects/${item.id}`} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-primary hover:underline">
                        Apply for Project <ArrowRight size={12} />
                      </Link>
                    )}
                    {item.type === "opportunity" && item.linkUrl && (
                      <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-primary hover:underline">
                        Apply External <ArrowRight size={12} />
                      </a>
                    )}
                    {item.type === "news" && (
                      <Link href={`/news/${item.id}`} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-primary hover:underline">
                        View Notice <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
