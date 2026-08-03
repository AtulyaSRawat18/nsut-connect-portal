"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, EyeOff, Loader2, ShieldX, X } from "lucide-react";

type Action = "resolved" | "dismissed" | "hidden" | "removed";

export default function AdminReportActions({ reportId, canModeratePost }: { reportId: string; canModeratePost: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Action | null>(null);
  const [errorText, setErrorText] = useState("");

  const act = async (action: Action) => {
    const note = window.prompt(action === "removed" ? "Record why the post should be soft-removed" : action === "hidden" ? "Record why the post should be hidden" : "Record the report decision");
    if (!note?.trim()) return;
    setBusy(action);
    setErrorText("");
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, note: note.trim() }) });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) setErrorText(body.message || "Unable to complete moderation"); else router.refresh();
    } finally { setBusy(null); }
  };

  const buttons: Array<{ action: Action; label: string; icon: typeof Check; className: string }> = [
    { action: "resolved", label: "Resolve", icon: Check, className: "bg-green-600 text-white" },
    { action: "dismissed", label: "Dismiss", icon: X, className: "border border-outline text-foreground" },
    ...(canModeratePost ? [
      { action: "hidden" as const, label: "Hide", icon: EyeOff, className: "border border-amber-500/40 text-amber-700" },
      { action: "removed" as const, label: "Soft remove", icon: ShieldX, className: "border border-red-500/40 text-red-600" },
    ] : []),
  ];

  return <div><div className="flex flex-wrap gap-2">{buttons.map((button) => { const Icon = button.icon; return <button key={button.action} type="button" disabled={busy !== null} onClick={() => act(button.action)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50 ${button.className}`}>{busy === button.action ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}{button.label}</button>; })}</div>{errorText && <p role="alert" className="mt-3 text-xs font-bold text-red-600">{errorText}</p>}</div>;
}
