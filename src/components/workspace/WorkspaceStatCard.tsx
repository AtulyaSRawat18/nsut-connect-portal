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
    <article className="workspace-stat">
      <div className="mb-5 flex items-start justify-between">
        <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
        {detail && (
          <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-bold normal-case tracking-normal text-foreground/50">
            {detail}
          </span>
        )}
      </div>
      <p className="text-3xl font-semibold tracking-normal text-foreground">{value}</p>
      <p className="mt-1 text-xs font-bold normal-case tracking-normal text-foreground/50">{label}</p>
    </article>
  );
}
