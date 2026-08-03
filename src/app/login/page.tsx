"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Loader2, School } from "lucide-react";
import ResearchBackdrop from "@/components/shared/ResearchBackdrop";

type PortalMode = "student" | "faculty";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [portalMode, setPortalMode] = useState<PortalMode>("student");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, portalMode }) });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) { setError(result.message || "Unable to sign in"); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Authentication is temporarily unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbf7ef] px-4 py-12 dark:bg-background">
      <ResearchBackdrop />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-outline bg-surface/95 p-7 shadow-2xl backdrop-blur md:p-9">
        <div className="absolute left-0 top-0 h-1 w-full bg-primary" />
        <div className="mb-7 mt-2 text-center"><img src="/nsut-logo.png" alt="NSUT Logo" className="mx-auto mb-4 h-16 w-16" /><p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Choose your workspace</p><h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-foreground">Portal Login</h1><p className="mt-2 text-sm font-medium text-foreground/60">Your selection chooses the interface. Live database roles still decide every permission.</p></div>

        <div className="mb-6 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Portal mode">
          {([
            { mode: "student" as const, label: "Student", detail: "Projects and applications", icon: GraduationCap },
            { mode: "faculty" as const, label: "Faculty / Staff", detail: "Faculty, moderator or admin", icon: School },
          ]).map((option) => {
            const Icon = option.icon;
            const selected = portalMode === option.mode;
            return <button key={option.mode} type="button" role="radio" aria-checked={selected} onClick={() => setPortalMode(option.mode)} className={`rounded-xl border p-4 text-left transition-all ${selected ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-outline bg-background hover:border-primary/50"}`}><Icon className={`mb-3 h-5 w-5 ${selected ? "text-primary" : "text-foreground/40"}`} /><span className="block text-sm font-black text-foreground">{option.label}</span><span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-foreground/45">{option.detail}</span></button>;
          })}
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {error && <div role="alert" className="border-l-2 border-primary bg-primary/10 p-4 text-sm font-bold text-primary">{error}</div>}
          <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-foreground">Institutional Email</span><input type="email" required autoComplete="email" className="w-full border border-outline bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary" placeholder="name@nsut.ac.in" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-foreground">Password</span><input type="password" required minLength={8} autoComplete="current-password" className="w-full border border-outline bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Enter password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 bg-primary py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : `Sign in as ${portalMode === "student" ? "Student" : "Faculty / Staff"}`}</button>
        </form>
        <div className="mt-7 border-t border-outline pt-6 text-center"><Link href="/signup" className="block text-xs font-bold uppercase tracking-widest text-primary hover:underline">Need an account? Register here</Link></div>
      </div>
    </div>
  );
}
