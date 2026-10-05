"use client";

import { ApplyProjectButton } from "./ApplyProjectButton";
import { ContributionRequestButton } from "./ContributionRequestButton";

export function StudentProjectAction({ projectId, availableSeats, isClosed, applicationFormUrl }: { projectId: string; availableSeats: number; isClosed: boolean; applicationFormUrl: string }) {
  if (isClosed) return <button disabled className="block w-full cursor-not-allowed rounded bg-outline py-4 text-sm font-bold normal-case tracking-normal text-foreground/50">Project closed</button>;
  if (availableSeats <= 0) return <ContributionRequestButton projectId={projectId} />;
  return <ApplyProjectButton projectId={projectId} availableSeats={availableSeats} isClosed={false} applicationFormUrl={applicationFormUrl} />;
}
