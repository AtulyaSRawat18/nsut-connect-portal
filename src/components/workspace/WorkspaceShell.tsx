"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ClipboardList,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Newspaper,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useLogout } from "@/utils/auth";

export type WorkspaceIcon =
  | "dashboard"
  | "reports"
  | "verification"
  | "projects"
  | "applications"
  | "publications"
  | "profile"
  | "news"
  | "users"
  | "audit";

const icons = {
  dashboard: LayoutDashboard,
  reports: AlertTriangle,
  verification: CheckCircle,
  projects: FolderKanban,
  applications: ClipboardList,
  publications: BookOpen,
  profile: UserRound,
  news: Newspaper,
  users: Users,
  audit: FileText,
} satisfies Record<WorkspaceIcon, typeof LayoutDashboard>;

export interface WorkspaceNavigationItem {
  label: string;
  href: string;
  icon: WorkspaceIcon;
  badge?: number;
}

export default function WorkspaceShell({
  children,
  title,
  roleLabel,
  user,
  navigation,
}: {
  children: ReactNode;
  title: string;
  roleLabel: string;
  user: { name: string; email: string };
  navigation: WorkspaceNavigationItem[];
}) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-b border-outline bg-surface lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="border-b border-outline p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black text-foreground">{title}</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{roleLabel}</p>
            </div>
          </div>
          <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-xs text-foreground/50">{user.email}</p>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-4 lg:block lg:space-y-2 lg:overflow-visible">
          {navigation.map((item) => {
            const Icon = icons[item.icon];
            const active =
              pathname === item.href ||
              (item.href !== "/moderator" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/65 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 lg:absolute lg:bottom-0 lg:w-[17rem]">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 p-5 md:p-8 lg:p-10">{children}</main>
    </div>
  );
}
