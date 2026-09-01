const Loading = () => {
  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950 sm:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-64 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
          <div className="h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
