"use client";

import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) return;
      router.push("/");
      router.refresh();
    } catch {
      // Keep the current screen if the server could not revoke the session.
    }
  };

  return logout;
}
