"use client";

import { useEffect, useState } from "react";
import {
  Sparkles, Calendar, ArrowRight, Loader2, SlidersHorizontal, Search
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
}

export default function StudentFeed({ userProfile }: { userProfile: any }) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [personalized, setPersonalized] = useState(true); // default to true on dashboard
  const userDept = userProfile?.department || null;

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      try {
        const res = await fetch(`/api/feed?filter=${filter}&personalized=${personalized}`);
        const data = await res.json();
        setFeedItems(data.feedItems || []);
      } catch (err) {
        console.error("Failed to load dashboard feed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, [filter, personalized]);

  return (
    <div className="space-y-8 mt-12 border-t border-outline/50 pt-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" /> Knowledge Sphere Feed
          </h2>
          <p className="text-sm text-foreground/50">Personalized updates tailored to your profile.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {userDept && (
            <button
              onClick={() => setPersonalized(!personalized)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                personalized
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground/60 border-outline hover:border-primary"
              }`}
            >
              <SlidersHorizontal size={10} />
              {personalized ? `Dept: ${userDept}` : "Show All Depts"}
            </button>
          )}

          <div className="flex border border-outline bg-background p-0.5 rounded">
            {["all", "news", "projects", "opportunities"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${
                  filter === tab
                    ? "bg-foreground text-background"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="animate-spin w-6 h-6 text-primary" />
        </div>
      ) : feedItems.length === 0 ? (
        <div className="py-12 border border-dashed border-outline rounded text-center">
          <p className="text-xs text-foreground/50 italic">No updates in your feed right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedItems.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="bg-surface border border-outline p-6 hover:border-primary transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                    item.type === "news" ? "bg-red-500/10 text-red-500" :
                    item.type === "project" ? "bg-green-500/10 text-green-500" :
                    "bg-blue-500/10 text-blue-500"
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors truncate">
                  {item.title}
                </h4>

                <p className="text-xs text-foreground/50 leading-relaxed mb-4 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-outline/30 mt-auto">
                <span className="text-[9px] font-bold text-foreground/45">
                  🏷️ {item.department}
                </span>

                <div className="flex items-center gap-2">
                  {item.type === "project" && (
                    <Link href={`/projects/${item.id}`} className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-0.5">
                      Apply <ArrowRight size={10} />
                    </Link>
                  )}
                  {item.type === "opportunity" && item.linkUrl && (
                    <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-0.5">
                      Explore <ArrowRight size={10} />
                    </a>
                  )}
                  {item.type === "news" && (
                    <Link href={`/news/${item.id}`} className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-0.5">
                      Read <ArrowRight size={10} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <Link href="/feed" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:underline">
          View Complete Knowledge Sphere Feed <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
