import { AgentDefinition } from "@/types/AgentDefinitions";
import { runOrchestratorAgent } from "./orchestrator";
import { AgentRole } from "@/types/AgentRole";
import { runResearcherAgent } from "./researcher";
import { runCoderAgent } from "./coder";
import { runCalculatorAgent } from "./calculator";

export const agentRegistry: Record<AgentRole, AgentDefinition<any, any>> = {
  orchestrator: {
    name: "Orchestrator Agent",
    description:
      "Root coordinating agent that breaks down high-level user objectives into structured execution plans, delegates focused sub-tasks to specialized sub-agents, and synthesizes incoming findings into a final response.",
    run: (ctx) => runOrchestratorAgent(ctx),
  },
  researcher: {
    name: "Researcher Agent",
    description:
      "Focused worker sub-agent specialized in deep investigation, information retrieval, and fact verification. Use for qualitative research, data synthesis, and literature analysis. Do NOT use for numerical calculations or source code editing.",
    run: (ctx) => runResearcherAgent(ctx),
  },
  coder: {
    name: "Coder Agent",
    description:
      "Autonomous software engineering sub-agent operating inside an isolated micro-VM sandbox. Inspects directory structures, reads source code, runs bash terminal commands, modifies files with surgical diffs, executes test suites, and implements bug fixes or features. Do NOT use for standalone arithmetic or mathematical expressions.",
    run: (ctx) => runCoderAgent(ctx),
    isLongRunning: true,
    requiresSandbox: true,
  },
  calculator: {
    name: "Calculator Agent",
    description:
      "Dedicated mathematical computation sub-agent. Use EXCLUSIVELY for arithmetic operations, mathematical expressions, numerical evaluations, and formulas. Computes exact numerical values step-by-step.",
    run: (ctx) => runCalculatorAgent(ctx),
  },
};
