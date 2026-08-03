const cards = Array.from({ length: 6 }, (_, index) => index);

export default function DiscoveryLoading() {
  return (
    <div className="min-h-screen bg-background py-16" aria-busy="true" aria-label="Loading content">
      <div className="mx-auto max-w-7xl animate-pulse px-6">
        <div className="mb-4 h-12 w-full max-w-xl rounded-lg bg-foreground/10" />
        <div className="mb-10 h-5 w-full max-w-2xl rounded bg-foreground/10" />
        <div className="mb-12 grid gap-3 rounded-2xl border border-outline bg-surface p-4 md:grid-cols-[1fr_12rem_10rem]">
          <div className="h-12 rounded-lg bg-foreground/10" />
          <div className="h-12 rounded-lg bg-foreground/10" />
          <div className="h-12 rounded-lg bg-foreground/10" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card} className="min-h-56 rounded-xl border border-outline bg-surface p-7">
              <div className="mb-6 h-4 w-24 rounded bg-foreground/10" />
              <div className="mb-3 h-7 w-4/5 rounded bg-foreground/10" />
              <div className="mb-2 h-4 rounded bg-foreground/10" />
              <div className="mb-8 h-4 w-3/4 rounded bg-foreground/10" />
              <div className="h-9 w-28 rounded bg-foreground/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
