"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldPlus, UserCheck, UserX } from "lucide-react";

type PortalRole = "student" | "faculty" | "moderator" | "admin";

export default function UserManagementActions({ userId, status, roles, isSelf }: { userId: string; status: string; roles: string[]; isSelf: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState<PortalRole>("student");
  const [busy, setBusy] = useState<string | null>(null);
  const [errorText, setErrorText] = useState("");

  const updateStatus = async (nextStatus: "active" | "suspended") => {
    const reason = nextStatus === "suspended" ? window.prompt("Record the suspension reason") : undefined;
    if (nextStatus === "suspended" && !reason?.trim()) return;
    setBusy(nextStatus);
    setErrorText("");
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus, reason: reason?.trim() }) });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) setErrorText(body.message || "Unable to update account"); else router.refresh();
    } finally { setBusy(null); }
  };

  const assignRole = async () => {
    if (roles.includes(role)) return;
    setBusy("role");
    setErrorText("");
    try {
      const response = await fetch(`/api/admin/users/${userId}/roles`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) setErrorText(body.message || "Unable to assign role"); else router.refresh();
    } finally { setBusy(null); }
  };

  return <div className="mt-5 border-t border-outline pt-4">
    <div className="flex flex-wrap gap-2">
      {status !== "active" && <button type="button" disabled={busy !== null} onClick={() => updateStatus("active")} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busy === "active" ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3 w-3" />}Activate</button>}
      {status !== "suspended" && !isSelf && <button type="button" disabled={busy !== null} onClick={() => updateStatus("suspended")} className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-50">{busy === "suspended" ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserX className="h-3 w-3" />}Suspend</button>}
      <div className="flex min-w-[16rem] flex-1 gap-2 sm:flex-none"><select value={role} onChange={(event) => setRole(event.target.value as PortalRole)} aria-label="Role to assign" className="min-w-0 flex-1 rounded-lg border border-outline bg-background px-3 py-2 text-xs font-bold"><option value="student">Student</option><option value="faculty">Faculty</option><option value="moderator">Moderator</option><option value="admin">Admin</option></select><button type="button" disabled={busy !== null || roles.includes(role)} onClick={assignRole} className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-xs font-bold text-background disabled:opacity-40">{busy === "role" ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldPlus className="h-3 w-3" />}Assign</button></div>
    </div>
    {errorText && <p role="alert" className="mt-3 text-xs font-bold text-red-600">{errorText}</p>}
  </div>;
}
