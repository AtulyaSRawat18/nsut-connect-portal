import type { ReactNode } from "react";

export default function WorkspaceStatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: number | string;
  detail?: string;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-outline bg-surface p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">{icon}</div>
        {detail && (
          <span className="rounded-full bg-foreground/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground/50">
            {detail}
          </span>
        )}
      </div>
      <p className="text-3xl font-black tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">{label}</p>
    </article>
  );
}
