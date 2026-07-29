"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";

export default function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"resolved" | "dismissed" | null>(null);

  const resolve = async (status: "resolved" | "dismissed") => {
    const note = window.prompt(
      status === "resolved" ? "Resolution note" : "Why should this report be dismissed?",
    );
    if (!note?.trim()) return;
    setBusy(status);
    try {
      const response = await fetch(`/api/moderator/reports/${reportId}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: note.trim() }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { message?: string };
        alert(body.message || "Unable to resolve this report");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => resolve("resolved")}
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
      >
        {busy === "resolved" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        Resolve
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => resolve("dismissed")}
        className="inline-flex items-center gap-2 rounded-lg border border-outline px-3 py-2 text-xs font-bold text-foreground disabled:opacity-50"
      >
        {busy === "dismissed" ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
        Dismiss
      </button>
    </div>
  );
}
