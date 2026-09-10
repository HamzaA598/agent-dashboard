import { AgentDefinition } from "@/types/AgentDefinitions";
import { runOrchestratorAgent } from "./orchestrator";
import { AgentRole } from "@/types/AgentRole";
import { runResearcherAgent } from "./researcher";

export const agentRegistry: Record<AgentRole, AgentDefinition<any>> = {
  orchestrator: {
    name: "orch",
    description: "",
    run: (ctx) => runOrchestratorAgent(ctx),
  },
  researcher: {
    name: "res",
    description: "",
    run: (ctx) => runResearcherAgent(ctx),
  },
};
