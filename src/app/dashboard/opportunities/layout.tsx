import type { ReactNode } from "react";
import { requirePageIdentity } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function OpportunityManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePageIdentity({ roles: ["faculty", "admin"] });
  return children;
}
