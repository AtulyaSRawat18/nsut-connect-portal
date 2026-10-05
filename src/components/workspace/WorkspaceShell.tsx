"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, BookOpen, CheckCircle, ClipboardList, FileText, FolderKanban, LayoutDashboard, LogOut, MessageSquare, Newspaper, ShieldCheck, UserRound, Users } from "lucide-react";
import { useLogout } from "@/utils/auth";

export type WorkspaceIcon = "dashboard" | "reports" | "verification" | "projects" | "applications" | "publications" | "forum" | "profile" | "news" | "users" | "audit";

const icons = { dashboard: LayoutDashboard, reports: AlertTriangle, verification: CheckCircle, projects: FolderKanban, applications: ClipboardList, forum: MessageSquare, publications: BookOpen, profile: UserRound, news: Newspaper, users: Users, audit: FileText } satisfies Record<WorkspaceIcon, typeof LayoutDashboard>;

export interface WorkspaceNavigationItem { label: string; href: string; icon: WorkspaceIcon; badge?: number; }

export default function WorkspaceShell({ children, title, roleLabel, user, navigation }: { children: ReactNode; title: string; roleLabel: string; user: { name: string; email: string }; navigation: WorkspaceNavigationItem[] }) {
  const pathname = usePathname();
  const logout = useLogout();
  const rootHref = navigation[0]?.href;

  return <div className="workspace-layout">
    <aside className="workspace-sidebar">
      <div className="workspace-identity"><div className="workspace-title"><ShieldCheck size={22} /><div><h2>{title}</h2><p>{roleLabel}</p></div></div><strong>{user.name}</strong><span>{user.email}</span></div>
      <nav className="workspace-navigation" aria-label={`${roleLabel} workspace`}>{navigation.map((item) => { const Icon = icons[item.icon]; const active = pathname === item.href || (item.href !== rootHref && pathname.startsWith(`${item.href}/`)); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}><Icon size={17} /><span>{item.label}</span>{item.badge !== undefined && item.badge > 0 && <span className="workspace-badge">{item.badge}</span>}</Link>; })}</nav>
      <div className="workspace-signout"><button type="button" onClick={logout}><LogOut size={17} /> Sign out</button></div>
    </aside>
    <section className="workspace-content" aria-label={title}>{children}</section>
  </div>;
}
