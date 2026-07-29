"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

export default function AdminVerificationActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"active" | "suspended" | null>(null);

  const updateStatus = async (status: "active" | "suspended") => {
    setBusy(status);
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reason: status === "suspended" ? "Faculty verification rejected" : undefined,
        }),
      });
      if (!response.ok) {
        const result = (await response.json()) as { message?: string };
        alert(result.message || "Unable to update this account");
        return;
      }
      router.refresh();
    } catch {
      alert("The admin service is temporarily unavailable");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        aria-label="Approve faculty account"
        disabled={busy !== null}
        onClick={() => updateStatus("active")}
        className="rounded bg-green-50 p-2 text-green-600 hover:bg-green-100 disabled:opacity-50"
      >
        {busy === "active" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
      </button>
      <button
        type="button"
        aria-label="Reject faculty account"
        disabled={busy !== null}
        onClick={() => updateStatus("suspended")}
        className="rounded bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-50"
      >
        {busy === "suspended" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
      </button>
    </div>
  );
}
