import { getAgentById } from "@/lib/agents-db";
import Link from "next/link";
import TriggerTestRunButton from "./components/trigger-test-run-button";

interface AgentProps {
  params: Promise<{ agentId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const Agent = async ({ params, searchParams }: AgentProps) => {
  const { agentId } = await params;
  const { tab = "overview" } = await searchParams;

  const agent = await getAgentById(agentId);

  if (agent == null) return <div>agent not found</div>;
  return (
    <>
      <div className="flex gap-2">
        <Link href="/">go to dashboard</Link>
        <Link href={`/agents/${agentId}?tab=overview`}>Overview</Link>
        <Link href={`/agents/${agentId}?tab=logs`}>Logs</Link>
        <Link href={`/agents/${agentId}?tab=config`}>Config</Link>
      </div>

      <TriggerTestRunButton />

      {tab === "overview" ? (
        <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 transition-colors hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-800/40 dark:hover:border-zinc-700">
          <div>
            <div className="font-medium text-zinc-900 dark:text-zinc-100">
              {agent.name}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {agent.role}
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              agent.status === "active"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {agent.status}
          </span>
        </div>
      ) : tab === "logs" ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Execution Logs
          </h2>
          <div className="space-y-2 font-mono text-xs">
            {agent.logs.map((log, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-md bg-zinc-50 p-2.5 dark:bg-zinc-800/60"
              >
                <span className="text-zinc-400 dark:text-zinc-500">
                  {log.timestamp}
                </span>
                <span
                  className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                    log.type === "success"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : log.type === "warning"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                  }`}
                >
                  {log.type}
                </span>
                <span className="flex-1 text-zinc-700 dark:text-zinc-300">
                  {log.event}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : tab === "config" ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Model Configuration
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Model</span>
              <p className="mt-1 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {agent.config.model}
              </p>
            </div>
            <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Temperature</span>
              <p className="mt-1 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {agent.config.temperature}
              </p>
            </div>
            <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Max Tokens</span>
              <p className="mt-1 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {agent.config.maxTokens.toLocaleString()}
              </p>
            </div>
            <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Enabled Tools</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {agent.config.tools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center rounded bg-zinc-200 px-2 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>unknown tab</div>
      )}
    </>
  );
};

export default Agent;
