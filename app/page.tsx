import { Suspense } from "react";
import { AgentListSkeleton, MetricsSkeleton } from "./components/skeletons";
import AgentList from "./components/agent-list";
import TokenMetrics from "./components/token-metrics";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <h1 className="text-3xl font-bold tracking-tight">
            AI Agent Fleet Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Real-time streaming dashboard with autonomous multi-agent
            orchestration
          </p>
        </header>

        {/* Global Chat Launcher Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Global Multi-Agent Chat
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Direct conversational gateway to the root orchestrator. Sub-agents
              are dispatched autonomously.
            </p>
          </div>
          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span>Open Global Chat</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <section className="space-y-6">
          <Suspense fallback={<AgentListSkeleton />}>
            <AgentList />
          </Suspense>

          <Suspense fallback={<MetricsSkeleton />}>
            <TokenMetrics />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
