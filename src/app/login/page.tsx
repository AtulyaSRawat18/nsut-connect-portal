"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (isSignUp) {
      if (!email.endsWith("@nsut.ac.in")) {
        setError("You must use a valid institutional email (@nsut.ac.in).");
        setLoading(false);
        return;
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            roll_number: rollNumber,
            full_name: fullName,
            email: email,
            role: "student"
          }
        }
      });
      if (error) setError(error.message);
      else {
        alert("Registration successful! Check your NSUT email to confirm your account.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else {
        router.push("/dashboard");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 transition-colors">
      <div className="max-w-md w-full bg-surface p-8 rounded-xl border border-outline shadow-xl relative z-10 overflow-hidden">
        
        {/* Top Aesthetic Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

        <div className="text-center mb-8 mt-4">
          <img src="/nsut-logo.png" alt="NSUT Logo" className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-foreground uppercase tracking-wider">
            {isSignUp ? "Student Registration" : "Portal Login"}
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
          
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-background border border-outline text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-foreground/30"
                  placeholder="First Last"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">NSUT Roll Number</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-background border border-outline text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-foreground/30"
                  placeholder="2024UEXXXX"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Institutional Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-background border border-outline text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-foreground/30"
              placeholder="name@nsut.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            className="w-full bg-primary text-on-primary py-4 text-sm font-bold uppercase tracking-widest hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : (isSignUp ? "Register Account" : "Sign In to Portal")}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-outline pt-6">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary text-xs font-bold uppercase tracking-widest shadow-none hover:underline"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
}
