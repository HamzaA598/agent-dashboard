import { AgentDefinition } from "@/types/AgentDefinitions";
import { runOrchestratorAgent } from "./orchestrator";
import { AgentRole } from "@/types/AgentRole";
import { runResearcherAgent } from "./researcher";

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
};
