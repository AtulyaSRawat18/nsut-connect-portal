"use client";

import { useRouter } from "next/navigation";
import RegistrationSteps from "@/components/auth/RegistrationSteps";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import type { EditableProfile } from "@/components/profile/ProfileEditForm";

export default function OnboardingProfile({ profile, isActive }: { profile: EditableProfile; isActive: boolean }) {
  const router = useRouter();

  async function finish() {
    if (isActive) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login?status=pending&profile=complete");
    router.refresh();
  }

  return <div className="min-h-screen bg-background px-6 py-12"><div className="mx-auto max-w-4xl"><RegistrationSteps current={3} />{!isActive && <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-6 text-amber-700">Complete your faculty profile now. Institutional approval is still required before the faculty dashboard opens.</div>}<ProfileEditForm profile={profile} onUpdate={finish} completionMode /></div></div>;
}
