import { AutoRefresher } from "@/app/components/auto-refresher";
import { db } from "@/lib/db";
import { agentExecutions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

interface LogsParams {
  agentId: string;
}

const Logs = async ({ agentId }: LogsParams) => {
  const logs = await db
    .select()
    .from(agentExecutions)
    .where(eq(agentExecutions.agentId, agentId))
    .orderBy(desc(agentExecutions.createdAt));

  return (
    <>
      <AutoRefresher
        durationMs={2000}
        enabled={logs.some((log) => log.status === "executing")}
      />
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Component Header */}
        <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800/80">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Execution Runs & Logs
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Background tasks dispatched to Trigger.dev workers
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {logs.length} {logs.length === 1 ? "run" : "runs"}
          </span>
        </div>

        {/* Empty State */}
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-zinc-200 py-12 text-center dark:border-zinc-800">
            <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
              <svg
                className="h-5 w-5 text-zinc-400 dark:text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="mt-3 text-xs font-medium text-zinc-800 dark:text-zinc-200">
              No execution runs recorded yet
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Click &ldquo;Trigger Test Run&rdquo; in the header above to
              dispatch a background job.
            </p>
          </div>
        ) : (
          /* Logs List */
          <div className="space-y-3">
            {logs.map((log) => {
              const isCompleted = log.status === "completed";
              const isExecuting = log.status === "executing";
              const isFailed = log.status === "failed";

              return (
                <div
                  key={log.id}
                  className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3.5 transition-colors dark:border-zinc-800/80 dark:bg-zinc-950/40"
                >
                  {/* Header Row: Status Badge, Run Identifier, Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : isExecuting
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/50 dark:text-blue-300"
                              : isFailed
                                ? "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-300"
                                : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {/* Pulsing Dot indicator for in-flight jobs */}
                        {isExecuting && (
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                          </span>
                        )}
                        {log.status}
                      </span>

                      <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                        run_{log.id?.slice(0, 8)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                      {log.durationMs != null && (
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {log.durationMs}ms
                        </span>
                      )}
                      <span>
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleTimeString()
                          : ""}
                      </span>
                    </div>
                  </div>

                  {/* Input Payload Block */}
                  {log.input != null && (
                    <div className="mt-2.5 rounded-md border border-zinc-100 bg-white p-2 font-mono text-xs dark:border-zinc-800 dark:bg-zinc-900">
                      <span className="mb-0.5 block select-none text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Input
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {typeof log.input === "string"
                          ? log.input
                          : JSON.stringify(log.input)}
                      </span>
                    </div>
                  )}

                  {/* Output Payload Block */}
                  {log.output != null && (
                    <div className="mt-2 rounded-md border border-emerald-100 bg-emerald-50/50 p-2 font-mono text-xs dark:border-emerald-900/30 dark:bg-emerald-950/20">
                      <span className="mb-0.5 block select-none text-[10px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Output
                      </span>
                      <span className="text-emerald-800 dark:text-emerald-300">
                        {typeof log.output === "string"
                          ? log.output
                          : JSON.stringify(log.output)}
                      </span>
                    </div>
                  )}

                  {/* Error Banner */}
                  {log.error && (
                    <div className="mt-2 rounded-md border border-rose-200 bg-rose-50/70 p-2 font-mono text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
                      <span className="select-none font-semibold">Error: </span>
                      {log.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Logs;
