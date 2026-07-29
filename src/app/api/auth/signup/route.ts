import { NextResponse } from "next/server";
import { z } from "zod";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const signupSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email().endsWith("@nsut.ac.in"),
    role: z.enum(["student", "faculty"]),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    rollNumber: z.string().trim().max(30).optional(),
    course: z.string().trim().max(80).optional(),
    year: z.preprocess((value) => value === "" || value == null ? undefined : value, z.coerce.number().int().min(1).max(8).optional()),
    department: z.string().trim().max(80).optional(),
    designation: z.string().trim().max(100).optional(),
  })
  .superRefine((value, context) => {
    if (value.role === "student" && (!value.rollNumber || !value.course || !value.year)) {
      context.addIssue({ code: "custom", message: "Student academic details are required" });
    }
    if (value.role === "faculty" && (!value.department || !value.designation)) {
      context.addIssue({ code: "custom", message: "Faculty department and designation are required" });
    }
  });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return authError(403, "INVALID_ORIGIN", "Cross-origin registration is not allowed");
  }

  const rateLimit = checkRateLimit(request, "auth:signup", {
    limit: 3,
    windowMs: 60 * 60 * 1_000,
  });
  if (!rateLimit.allowed) {
    return authError(
      429,
      "RATE_LIMITED",
      "Too many registration attempts. Try again later.",
      { "Retry-After": String(rateLimit.retryAfterSeconds) },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return authError(
      400,
      "INVALID_REGISTRATION",
      parsed.error.issues[0]?.message || "Invalid registration details",
    );
  }

  const data = parsed.data;

  try {
    const supabase = await createClient();
    const callbackUrl = new URL("/auth/callback", request.url).toString();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: callbackUrl,
        data: {
          full_name: data.fullName,
          role: data.role,
          roll_number: data.rollNumber,
          course: data.course,
          year: data.year,
          department: data.department,
          designation: data.designation,
        },
      },
    });

    if (error) {
      return authError(409, "REGISTRATION_FAILED", error.message);
    }

    return NextResponse.json(
      {
        error: false,
        message:
          data.role === "faculty"
            ? "Verify your email. Faculty access will activate after institutional approval."
            : "Registration successful. Check your NSUT email to verify your account.",
      },
      { status: 201 },
    );
  } catch {
    return authError(503, "AUTH_UNAVAILABLE", "Registration is temporarily unavailable");
  }
}
