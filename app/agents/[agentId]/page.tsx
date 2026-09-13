import { agentRegistry } from "@/lib/ai/agents/registry";
import Link from "next/link";
import TriggerTestRunButton from "./components/trigger-test-run-button";
import Logs from "./components/logs";
import { AgentRole } from "@/types/AgentRole";

interface AgentProps {
  params: Promise<{ agentId: AgentRole }>;
  searchParams: Promise<{ tab?: string }>;
}

const AGENT_METADATA: Record<
  AgentRole,
  {
    architecture: string;
    capabilities: string[];
    tools: string[];
  }
> = {
  orchestrator: {
    architecture: "Root Coordination Engine (Vercel AI SDK Core)",
    capabilities: [
      "Objective Decomposition",
      "Dynamic Sub-Agent Delegation",
      "Streaming SSE Transport",
      "PostgreSQL Handoff Correlation",
    ],
    tools: ["delegateSubagent"],
  },
  researcher: {
    architecture: "Information Synthesis & Retrieval Engine",
    capabilities: [
      "Multi-Source Qualitative Research",
      "Fact Verification",
      "Step Budget Conservation",
      "Structured Checkpoint Continuation",
    ],
    tools: ["sampleTool", "handoffTask"],
  },
  coder: {
    architecture: "E2B Firecracker KVM Micro-VM Sandbox",
    capabilities: [
      "Isolated Linux Micro-VM",
      "Surgical Search-and-Replace Diffs",
      "Terminal Command & Test Execution",
      "Non-Zero Exit Self-Healing",
    ],
    tools: [
      "readSandboxedFile",
      "listSandboxedFile",
      "writeSandboxedFile",
      "executeSandboxedCommand",
      "patchSandboxedFile",
      "handoffTask",
    ],
  },
  calculator: {
    architecture: "Deterministic Arithmetic Engine",
    capabilities: [
      "Arbitrary Precision Calculations",
      "Division-by-Zero Guards",
      "Step-by-Step Mathematical Derivation",
    ],
    tools: ["calculator", "handoffTask"],
  },
};

const Agent = async ({ params, searchParams }: AgentProps) => {
  const { agentId } = await params;
  const { tab = "overview" } = await searchParams;

  const agent = agentRegistry[agentId];
  if (!agent) return <div className="p-8 text-zinc-500">Agent not found</div>;

  const meta = AGENT_METADATA[agentId] ?? {
    architecture: "AI Agent",
    capabilities: ["Autonomous Execution"],
    tools: [],
  };

  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link
            href="/"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">{agent.name}</span>
        </div>

        {/* Header with Title & Action Button */}
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                {agent.name}
              </h1>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400">
                Active
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {meta.architecture} &bull; {agent.description}
            </p>
          </div>
          <TriggerTestRunButton />
        </header>

        {/* Tab Navigation */}
        <nav className="flex gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
          {[
            { id: "overview", label: "Overview" },
            { id: "logs", label: "Logs" },
            { id: "config", label: "Config" },
          ].map((item) => {
            const isActive = tab === item.id;
            return (
              <Link
                key={item.id}
                href={`/agents/${agentId}?tab=${item.id}`}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Tab Contents */}
        {tab === "overview" ? (
          <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Capabilities & Architecture
            </h2>
            <div className="flex flex-wrap gap-2">
              {meta.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        ) : tab === "logs" ? (
          <Logs agentId={agentId} />
        ) : tab === "config" ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Model & Harness Configuration
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Model
                </span>
                <p className="mt-1 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  gemini-3.6-flash
                </p>
              </div>
              <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Step Limit (Stop Condition)
                </span>
                <p className="mt-1 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  isStepCount(5)
                </p>
              </div>
              <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Target Architecture
                </span>
                <p className="mt-1 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {meta.architecture}
                </p>
              </div>
              <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Enabled Tools
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {meta.tools.map((tool) => (
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
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            Unknown tab
          </div>
        )}
      </div>
    </main>
  );
};

export default Agent;
