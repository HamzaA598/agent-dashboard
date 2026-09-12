import { AgentDefinition } from "@/types/AgentDefinitions";
import { runOrchestratorAgent } from "./orchestrator";
import { AgentRole } from "@/types/AgentRole";
import { runResearcherAgent } from "./researcher";
import { runCoderAgent } from "./coder";

export const agentRegistry: Record<AgentRole, AgentDefinition<any>> = {
  orchestrator: {
    name: "Orchestrator Agent",
    description:
      "Root coordinating agent that breaks down high-level user objectives into structured execution plans, delegates focused sub-tasks to specialized sub-agents, and synthesizes incoming findings into a final response.",
    run: (ctx) => runOrchestratorAgent(ctx),
  },
  researcher: {
    name: "Researcher Agent",
    description:
      "Focused worker sub-agent specialized in deep investigation, fact verification, and calculations. Operates within an iterative tool loop and persists structured task handoff checkpoints when reaching step limits.",
    run: (ctx) => runResearcherAgent(ctx),
  },
  coder: {
    name: "Coder Agent",
    description:
      "Autonomous software engineering sub-agent operating inside an isolated micro-VM sandbox. Inspects directory structures, reads source code, runs bash terminal commands, modifies files with surgical diffs, executes test suites, and implements bug fixes or features.",
    run: (ctx) => runCoderAgent(ctx),
  },
};
