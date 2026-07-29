"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import zxcvbn from "zxcvbn";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").endsWith("@nsut.ac.in", "Must use official @nsut.ac.in email"),
  role: z.enum(["student", "faculty"]),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "At least one uppercase")
    .regex(/[a-z]/, "At least one lowercase")
    .regex(/[0-9]/, "At least one number")
    .regex(/[^A-Za-z0-9]/, "At least one special character"),
  rollNumber: z.string().optional(),
  course: z.string().optional(),
  year: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === "student") {
    if (!data.rollNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Roll number is required", path: ["rollNumber"] });
    if (!data.course) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Course is required", path: ["course"] });
    if (!data.year) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Year is required", path: ["year"] });
  } else {
    if (!data.department) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Department is required", path: ["department"] });
    if (!data.designation) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Designation is required", path: ["designation"] });
  }
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "student",
    },
  });

  const selectedRole = watch("role");
  const passwordValue = watch("password");

  useEffect(() => {
    if (passwordValue) {
      const result = zxcvbn(passwordValue);
      setPasswordScore(result.score);
    } else {
      setPasswordScore(0);
    }
  }, [passwordValue]);

  const onSubmit = async (data: SignupFormValues) => {
    setServerError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setServerError(result.message || "Registration failed");
        return;
      }

      alert(result.message || "Registration successful. Check your NSUT email.");
      router.push("/login");
    } catch {
      setServerError("Registration is temporarily unavailable");
    }
  };

  const getStrengthColor = () => {
    switch (passwordScore) {
      case 0: return "bg-red-500 w-1/5";
      case 1: return "bg-orange-500 w-2/5";
      case 2: return "bg-yellow-500 w-3/5";
      case 3: return "bg-blue-400 w-4/5";
      case 4: return "bg-green-500 w-full";
      default: return "bg-gray-200 w-0";
    }
  };

  const getStrengthText = () => {
    if (!passwordValue) return "";
    switch (passwordScore) {
      case 0:
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "";
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
            Portal Unified Registration
          </h2>
          <p className="text-foreground/70 mt-2 text-sm font-medium">
            Create your account to access NSUT resources
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && (
            <div className="bg-primary/10 border-l-2 border-primary p-4 text-primary text-sm font-bold">
              {serverError}
            </div>
          )}

          {/* Role Selection */}
          <div className="flex gap-4 p-1 bg-background border border-outline rounded-md">
            <label className={`flex-1 text-center py-2 text-sm font-bold uppercase tracking-widest cursor-pointer transition-colors ${selectedRole === "student" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-foreground/5"}`}>
              <input type="radio" value="student" className="hidden" {...register("role")} />
              Student
            </label>
            <label className={`flex-1 text-center py-2 text-sm font-bold uppercase tracking-widest cursor-pointer transition-colors ${selectedRole === "faculty" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-foreground/5"}`}>
              <input type="radio" value="faculty" className="hidden" {...register("role")} />
              Faculty
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Full Name</label>
            <input
              type="text"
              className={`w-full px-4 py-3 bg-background border ${errors.fullName ? "border-red-500" : "border-outline"} text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-foreground/30`}
              placeholder="Full Name"
              {...register("fullName")}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Institutional Email</label>
            <input
              type="email"
              className={`w-full px-4 py-3 bg-background border ${errors.email ? "border-red-500" : "border-outline"} text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-foreground/30`}
              placeholder="name@nsut.ac.in"
              {...register("email")}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
          </div>

          {selectedRole === "student" && (
            <>
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">NSUT Roll Number</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 bg-background border ${errors.rollNumber ? "border-red-500" : "border-outline"} text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-foreground/30`}
                  placeholder="2024UEXXXX"
                  {...register("rollNumber")}
                />
                {errors.rollNumber && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.rollNumber.message}</p>}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Course</label>
                  <select
                    className={`w-full px-4 py-3 bg-background border ${errors.course ? "border-red-500" : "border-outline"} text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                    {...register("course")}
                  >
                    <option value="">Select</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="Ph.D">Ph.D</option>
                    <option value="BBA">BBA</option>
                    <option value="MBA">MBA</option>
                  </select>
                  {errors.course && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.course.message}</p>}
                </div>
                <div className="w-1/3">
                  <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Year</label>
                  <select
                    className={`w-full px-4 py-3 bg-background border ${errors.year ? "border-red-500" : "border-outline"} text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                    {...register("year")}
                  >
                    <option value="">Year</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                  {errors.year && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.year.message}</p>}
                </div>
              </div>
            </>
          )}

          {selectedRole === "faculty" && (
            <>
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Department</label>
                <select
                  className={`w-full px-4 py-3 bg-background border ${errors.department ? "border-red-500" : "border-outline"} text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                  {...register("department")}
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science</option>
                  <option value="ECE">Electronics & Comm.</option>
                  <option value="IT">Information Tech</option>
                  <option value="MAC">Mathematics & Comp.</option>
                  <option value="MECH">Mechanical Eng.</option>
                  <option value="BT">Biotechnology</option>
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.department.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Designation</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 bg-background border ${errors.designation ? "border-red-500" : "border-outline"} text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-foreground/30`}
                  placeholder="Assistant Professor, etc."
                  {...register("designation")}
                />
                {errors.designation && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.designation.message}</p>}
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-3 pr-10 bg-background border ${errors.password ? "border-red-500" : "border-outline"} text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-foreground/30`}
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/50 hover:text-foreground outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Meter */}
            <div className="mt-2 h-1 w-full bg-outline rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${getStrengthColor()}`}></div>
            </div>
            <div className="flex justify-between items-center mt-1">
              {errors.password ? (
                <span className="text-red-500 text-xs font-semibold">{errors.password.message}</span>
              ) : (
                <span className="text-foreground/50 text-xs truncate max-w-[70%]">Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special</span>
              )}
              <span className="text-xs font-bold text-foreground">{getStrengthText()}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground py-4 text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" /> Processing...
              </>
            ) : "Register Account"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-outline pt-6">
          <Link href="/login" className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
