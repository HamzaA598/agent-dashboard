export const AgentListSkeleton = () => (
  <div className="h-48 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
    <div className="h-5 w-28 rounded bg-zinc-300 dark:bg-zinc-800 mb-4" />
    <div className="space-y-3">
      <div className="h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800/60" />
      <div className="h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800/60" />
    </div>
  </div>
);

export const MetricsSkeleton = () => (
  <div className="h-40 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
    <div className="h-5 w-44 rounded bg-zinc-300 dark:bg-zinc-800 mb-4" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="h-20 rounded-lg bg-zinc-200 dark:bg-zinc-800/60" />
      <div className="h-20 rounded-lg bg-zinc-200 dark:bg-zinc-800/60" />
      <div className="h-20 rounded-lg bg-zinc-200 dark:bg-zinc-800/60" />
    </div>
  </div>
);

