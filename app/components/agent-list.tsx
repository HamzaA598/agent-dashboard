import { AGENT_ROLES } from "@/constants/agent-roles";
import { agentRegistry } from "@/lib/ai/agents/registry";
import { db } from "@/lib/db";
import { agentExecutions } from "@/lib/db/schema";
import { count } from "drizzle-orm";
import Link from "next/link";

const AgentList = async () => {
  const executionCounts = await db
    .select({
      agentId: agentExecutions.agentId,
      count: count(),
    })
    .from(agentExecutions)
    .groupBy(agentExecutions.agentId);

  const countsMap = Object.fromEntries(
    executionCounts.map((r) => [r.agentId, Number(r.count)]),
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Active Multi-Agent Fleet
      </h2>
      <div className="grid gap-3">
        {AGENT_ROLES.map((role) => {
          const agent = agentRegistry[role];
          const runs = countsMap[role] ?? 0;

          return (
            <Link key={role} href={`/agents/${role}`}>
              <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-800/40 dark:hover:border-zinc-700">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {agent.name}
                    </span>
                    <span className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {role}
                    </span>
                  </div>
                  <p className="max-w-xl text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {agent.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {runs} {runs === 1 ? "run" : "runs"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400">
                    Ready
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AgentList;
