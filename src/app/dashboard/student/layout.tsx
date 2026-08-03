import type { ReactNode } from "react";
import { requirePageIdentity } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function StudentDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePageIdentity({ roles: ["student"] });
  return children;
}
