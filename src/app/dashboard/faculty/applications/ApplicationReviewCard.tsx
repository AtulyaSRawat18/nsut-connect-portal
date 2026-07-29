"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ApplicationReviewCard({ application }: { application: any }) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleAction = async (newStatus: "accepted" | "rejected") => {
    setLoadingAction(newStatus);

    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", application.id);

    setLoadingAction(null);

    if (error) {
      alert("Error updating application: " + error.message);
    } else {
      router.refresh();
    }
  };

  const studentName = application.portal_users?.name || "Unknown Student";
  const studentEmail = application.portal_users?.email || "";

  return (
    <div className="bg-surface border border-outline p-6 rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-lg">{studentName}</h4>
          <p className="text-xs text-foreground/70">{studentEmail}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Applied For</p>
          <Link href={`/projects/${application.projects.id}`} className="text-sm font-bold hover:underline">
            {application.projects.title}
          </Link>
        </div>
      </div>

      <div className="bg-background border border-outline border-dashed p-4 rounded text-sm text-foreground/80 my-4 whitespace-pre-wrap">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-2">Statement of Purpose</span>
        {application.statement_of_purpose}
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-outline">
        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest ${
          application.status === 'pending' ? 'bg-yellow-500/20 text-yellow-700' :
          application.status === 'accepted' ? 'bg-green-500/20 text-green-700' :
          'bg-red-500/20 text-red-700'
        }`}>
          {application.status}
        </span>

        {application.status === 'pending' && (
          <div className="flex gap-3">
            <button
              onClick={() => handleAction("rejected")}
              disabled={loadingAction !== null}
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-700 px-3 py-2 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {loadingAction === "rejected" ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              Reject
            </button>
            <button
              onClick={() => handleAction("accepted")}
              disabled={loadingAction !== null}
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest bg-primary text-on-primary px-4 py-2 rounded hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loadingAction === "accepted" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
