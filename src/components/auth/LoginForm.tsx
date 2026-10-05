"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  School,
} from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [portalMode, setPortalMode] = useState<"student" | "faculty">(
    "student",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAuth(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, portalMode }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Unable to sign in");
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(
        next?.startsWith("/idea") && !next.startsWith("//")
          ? next
          : "/dashboard",
      );
      router.refresh();
    } catch {
      setError("We couldn't connect. Please try signing in again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell mode="login">
      <p className="auth-eyebrow">Your next idea starts here</p>
      <h1 className="auth-title">Welcome back.</h1>
      <p className="auth-description">
        A place for curious minds, across every branch.
      </p>
      <form onSubmit={handleAuth} className="auth-form">
        <fieldset>
          <legend className="auth-label">I am a</legend>
          <div className="auth-role-options">
            {(
              [
                { value: "student", label: "Student", icon: GraduationCap },
                { value: "faculty", label: "Faculty / Staff", icon: School },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className={portalMode === value ? "selected" : ""}
              >
                <input
                  type="radio"
                  name="portalMode"
                  value={value}
                  checked={portalMode === value}
                  onChange={() => setPortalMode(value)}
                />
                <Icon size={18} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="auth-error">
            {error}
          </p>
        )}
        <label className="auth-label">
          University email
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@nsut.ac.in"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="auth-label">
          Password
          <span className="auth-password">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              title={showPassword ? "Hide password" : "Show password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <button className="auth-submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Signing in...
            </>
          ) : (
            <>
              Sign in <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      <p className="auth-switch">
        New to the community? <Link href="/signup">Create an account</Link>
      </p>
    </AuthShell>
  );
}
