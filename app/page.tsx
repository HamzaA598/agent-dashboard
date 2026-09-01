import { Suspense } from "react";
import { AgentListSkeleton, MetricsSkeleton } from "./components/skeletons";
import AgentList from "./components/agent-list";
import TokenMetrics from "./components/token-metrics";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <h1 className="text-3xl font-bold tracking-tight">
            AI Agent Orchestrator
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Real-time streaming dashboard with concurrent React Server Components
          </p>
        </header>

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
