import { getClusterMetrics } from "@/lib/actions";

const TokenMetrics = async () => {
  const { totalExecutions, totalThreads, totalMessages } =
    await getClusterMetrics();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Cluster Infrastructure Metrics
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-800/40">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Total Agent Executions
          </div>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {totalExecutions.toLocaleString()}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-800/40">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Active Conversations (Threads)
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalThreads.toLocaleString()}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-800/40">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Stored Message Turns
          </div>
          <div className="mt-1 text-2xl font-bold text-sky-600 dark:text-sky-400">
            {totalMessages.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenMetrics;
