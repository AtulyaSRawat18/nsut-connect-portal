"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import zxcvbn from "zxcvbn";
import RegistrationSteps from "@/components/auth/RegistrationSteps";

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.email("Enter a valid email").endsWith("@nsut.ac.in", "Use your official @nsut.ac.in email"),
  role: z.enum(["student", "faculty"]),
  password: z.string().min(8, "Use at least 8 characters").regex(/[A-Z]/, "Add an uppercase letter").regex(/[a-z]/, "Add a lowercase letter").regex(/[0-9]/, "Add a number").regex(/[^A-Za-z0-9]/, "Add a special character"),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<SignupValues>({ resolver: zodResolver(signupSchema), defaultValues: { role: "student" } });
  const role = useWatch({ control, name: "role" });
  const password = useWatch({ control, name: "password" });
  const passwordScore = password ? zxcvbn(password).score : 0;

  async function onSubmit(data: SignupValues) {
    setServerError("");
    const response = await fetch("/api/auth/signup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setServerError(result.message || "Registration failed");
      return;
    }
    setSubmittedEmail(data.email);
  }

  if (submittedEmail) {
    return <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12"><div className="w-full max-w-lg rounded-2xl border border-outline bg-surface p-8 text-center shadow-xl"><RegistrationSteps current={2} /><MailCheck className="mx-auto h-14 w-14 text-primary" /><h1 className="mt-5 text-3xl font-black text-foreground">Confirm your email</h1><p className="mt-4 leading-7 text-foreground/65">We sent a verification link to <strong className="text-foreground">{submittedEmail}</strong>. Open it to continue to profile setup.</p><p className="mt-4 rounded-lg border border-outline bg-background p-4 text-sm text-foreground/55">After confirmation: build your public academic profile, then continue to the dashboard. Faculty accounts still require institutional approval before faculty tools unlock.</p><Link href="/login" className="mt-7 inline-block text-xs font-bold uppercase tracking-widest text-primary hover:underline">Return to sign in</Link></div></div>;
  }

  const strengthWidth = ["w-1/5", "w-2/5", "w-3/5", "w-4/5", "w-full"][passwordScore] || "w-0";
  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"][passwordScore] || "bg-transparent";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-outline bg-surface p-8 shadow-xl">
        <div className="absolute left-0 top-0 h-1 w-full bg-primary" />
        <RegistrationSteps current={1} />
        <div className="mb-7 text-center"><Image src="/nsut-logo.png" alt="NSUT logo" width={64} height={64} className="mx-auto mb-4" /><h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Create your account</h1><p className="mt-2 text-sm text-foreground/60">Start with secure account details. Academic information comes after email confirmation.</p></div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && <p role="alert" className="border-l-2 border-primary bg-primary/10 p-4 text-sm font-bold text-primary">{serverError}</p>}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-outline bg-background p-1">{(["student", "faculty"] as const).map((item) => <label key={item} className={`cursor-pointer rounded-md py-3 text-center text-xs font-bold uppercase tracking-widest ${role === item ? "bg-primary text-on-primary" : "text-foreground/60 hover:bg-foreground/5"}`}><input type="radio" value={item} className="sr-only" {...register("role")} />{item}</label>)}</div>
          <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest">Full name</span><input autoComplete="name" {...register("fullName")} className={`w-full border bg-background px-4 py-3 outline-none focus:border-primary ${errors.fullName ? "border-red-500" : "border-outline"}`} />{errors.fullName && <span className="mt-1 block text-xs text-red-500">{errors.fullName.message}</span>}</label>
          <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest">Institutional email</span><input type="email" autoComplete="email" placeholder="name@nsut.ac.in" {...register("email")} className={`w-full border bg-background px-4 py-3 outline-none focus:border-primary ${errors.email ? "border-red-500" : "border-outline"}`} />{errors.email && <span className="mt-1 block text-xs text-red-500">{errors.email.message}</span>}</label>
          <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest">Password</span><span className="relative block"><input type={showPassword ? "text" : "password"} autoComplete="new-password" {...register("password")} className={`w-full border bg-background px-4 py-3 pr-12 outline-none focus:border-primary ${errors.password ? "border-red-500" : "border-outline"}`} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 text-foreground/50">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></span><span className="mt-2 block h-1 overflow-hidden rounded-full bg-outline"><span className={`block h-full ${strengthWidth} ${strengthColor}`} /></span>{errors.password ? <span className="mt-1 block text-xs text-red-500">{errors.password.message}</span> : <span className="mt-1 block text-xs text-foreground/45">8+ characters with upper/lowercase, number, and symbol</span>}</label>
          <button disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 bg-primary py-4 text-sm font-bold uppercase tracking-widest text-on-primary hover:brightness-110 disabled:opacity-50">{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}{isSubmitting ? "Creating account…" : "Continue to email confirmation"}</button>
        </form>
        <div className="mt-7 border-t border-outline pt-6 text-center"><Link href="/login" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Already registered? Sign in</Link></div>
      </div>
    </div>
  );
}
