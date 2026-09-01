import "server-only";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type AgentStatus = "active" | "idle" | "executing";

export interface AgentLog {
  timestamp: string;
  event: string;
  type: "info" | "success" | "warning";
}

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  description: string;
  capabilities: string[];
  logs: AgentLog[];
  config: AgentConfig;
}

const mockAgents: Agent[] = [
  {
    id: "researcher",
    name: "Deep Research Agent",
    role: "Web Search & Fact Synthesis",
    status: "active",
    description:
      "Performs recursive web searches, extracts key citations, and synthesizes multi-source research briefs.",
    capabilities: [
      "Live Web Crawling",
      "PDF Extraction",
      "Citation Verification",
      "Summarization",
    ],
    logs: [
      {
        timestamp: "11:20:04",
        event: "Initiated multi-query search on ArXiv",
        type: "info",
      },
      {
        timestamp: "11:20:06",
        event: "Extracted 14 research papers",
        type: "success",
      },
      {
        timestamp: "11:20:09",
        event: "Generated consolidated summary brief (820 tokens)",
        type: "success",
      },
    ],
    config: {
      model: "gemini-1.5-pro",
      temperature: 0.2,
      maxTokens: 8192,
      tools: ["search_web", "fetch_url", "extract_pdf"],
    },
  },
  {
    id: "coder",
    name: "Fullstack Coder",
    role: "Code Generation & Refactoring",
    status: "active",
    description:
      "Generates production-grade TypeScript/React code, refactors components, and analyzes AST structures.",
    capabilities: [
      "Fullstack TS/Next.js",
      "AST Refactoring",
      "Test Generation",
      "Git Integration",
    ],
    logs: [
      {
        timestamp: "11:15:30",
        event: "Analyzed app/agents/[agentId]/page.tsx",
        type: "info",
      },
      {
        timestamp: "11:15:32",
        event: "Generated TypeScript interfaces with Promise types",
        type: "success",
      },
      {
        timestamp: "11:15:35",
        event: "Zero lint errors detected",
        type: "success",
      },
    ],
    config: {
      model: "claude-3-5-sonnet",
      temperature: 0.0,
      maxTokens: 4096,
      tools: ["view_file", "replace_file_content", "run_command"],
    },
  },
  {
    id: "router",
    name: "Multi-Agent Orchestrator",
    role: "Task Routing & Planning",
    status: "idle",
    description:
      "Analyzes user prompts, creates execution plans (DAGs), and delegates sub-tasks to specialized domain agents.",
    capabilities: [
      "Intent Classification",
      "DAG Planning",
      "Subagent Dispatch",
      "Context Budgeting",
    ],
    logs: [
      {
        timestamp: "10:45:12",
        event: "Received multi-step pipeline request",
        type: "info",
      },
      {
        timestamp: "10:45:13",
        event: "Dispatched subagent task to 'researcher'",
        type: "info",
      },
      {
        timestamp: "10:45:25",
        event: "Pipeline completed successfully. Entering standby.",
        type: "success",
      },
    ],
    config: {
      model: "gpt-4o",
      temperature: 0.1,
      maxTokens: 2048,
      tools: ["dispatch_subagent", "evaluate_plan", "merge_results"],
    },
  },
];

export const getAgents = async (): Promise<Agent[]> => {
  await delay(200);
  return mockAgents;
};

export const getAgentById = async (id: string): Promise<Agent | undefined> => {
  await delay(300);
  return mockAgents.find((agent) => agent.id === id);
};

export const updateAgentStatus = async (
  id: string,
  newStatus: AgentStatus,
): Promise<void> => {
  await delay(200);
  const idx = mockAgents.findIndex((agent) => agent.id === id);
  mockAgents[idx].status = newStatus;
};

export interface TokenMetrics {
  totalTokens: number;
  estimatedCost: string;
  activeStreams: number;
}

export const getTokenMetrics = async (): Promise<TokenMetrics> => {
  await delay(1500);
  return { totalTokens: 142500, estimatedCost: "$2.85", activeStreams: 4 };
};
