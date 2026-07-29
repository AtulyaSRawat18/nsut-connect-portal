"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ToggleProjectStatus({ projectId, initialStatus }: { projectId: string; initialStatus: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleToggle = async () => {
    setLoading(true);
    const newStatus = initialStatus === "open" ? "closed" : "open";

    const { error } = await supabase
      .from("projects")
      .update({ status: newStatus })
      .eq("id", projectId);

    setLoading(false);

    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded transition-colors ${
        initialStatus === "open"
          ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
          : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
      }`}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : (initialStatus === "open" ? "Close Project" : "Reopen")}
    </button>
  );
}
