import type { ReactNode } from "react";
import { requirePageIdentity } from "@/lib/auth/server";

export default async function StudentDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePageIdentity({ roles: ["student"] });
  return children;
}
