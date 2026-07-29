"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(result.message || "Unable to sign in");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Authentication is temporarily unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 transition-colors">
      <div className="max-w-md w-full bg-surface p-8 rounded-xl border border-outline shadow-xl relative z-10 overflow-hidden">

        {/* Top Aesthetic Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

        <div className="text-center mb-8 mt-4">
          <img src="/nsut-logo.png" alt="NSUT Logo" className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-foreground uppercase tracking-wider">
            Portal Login
          </h2>
          <p className="text-foreground/70 mt-2 text-sm font-medium">
            Authenticate using your official credentials
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {error && (
            <div className="bg-primary/10 border-l-2 border-primary p-4 text-primary text-sm font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Institutional Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-background border border-outline text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-foreground/30"
              placeholder="name@nsut.ac.in"
              value={email}
              onChange={(e) => setemail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-background border border-outline text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-foreground/30"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground py-4 text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="animate-spin w-4 h-4" /> Processing...</>
            ) : "Sign In to Portal"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-outline pt-6">
          <Link
            href="/signup"
            className="text-primary text-xs font-bold uppercase tracking-widest hover:underline block"
          >
            Need an account? Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
