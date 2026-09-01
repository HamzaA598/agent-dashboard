import { getAgents } from "@/lib/agents-db";
import Link from "next/link";

const AgentList = async () => {
  const agents = await getAgents();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        AI Agents
      </h2>
      <div className="grid gap-3">
        {agents.map((agent) => (
          <Link key={agent.id} href={`/agents/${agent.id}`}>
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
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AgentList;
