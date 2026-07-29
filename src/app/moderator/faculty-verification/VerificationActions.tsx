"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, X } from "lucide-react";

type Decision = "approved" | "rejected" | "changes_requested";

export default function VerificationActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Decision | null>(null);

  const review = async (decision: Decision) => {
    const note = window.prompt(
      decision === "approved" ? "Approval note (optional)" : "Add a review note",
      "",
    );
    if (note === null || (decision !== "approved" && !note.trim())) return;
    setBusy(decision);
    try {
      const response = await fetch(
        `/api/moderator/faculty-verifications/${requestId}/review`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision, note: note.trim() || undefined }),
        },
      );
      if (!response.ok) {
        const body = (await response.json()) as { message?: string };
        alert(body.message || "Unable to review this faculty account");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const actions: Array<{ decision: Decision; label: string; icon: typeof Check; className: string }> = [
    { decision: "approved", label: "Approve", icon: Check, className: "bg-green-600 text-white" },
    { decision: "changes_requested", label: "Request changes", icon: RotateCcw, className: "border border-amber-500/40 text-amber-600" },
    { decision: "rejected", label: "Reject", icon: X, className: "border border-red-500/40 text-red-500" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.decision}
            type="button"
            disabled={busy !== null}
            onClick={() => review(action.decision)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50 ${action.className}`}
          >
            {busy === action.decision ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
