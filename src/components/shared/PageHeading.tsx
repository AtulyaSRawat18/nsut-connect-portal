import type { ReactNode } from "react";

export default function PageHeading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <header className="portal-page-heading"><div><p className="portal-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="portal-page-description">{description}</p></div>{children && <div className="portal-heading-actions">{children}</div>}</header>;
}
