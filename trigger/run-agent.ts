import { AgentExecutionContext } from "@/types/AgentExecutionContext";
import { AgentRole } from "@/types/AgentRole";
import { executeAgent } from "@/lib/ai/agents/execute-agent";
import { task } from "@trigger.dev/sdk";

interface RunAgentTaskProps {
  agentId: AgentRole;
  agentExecutionContext: AgentExecutionContext;
}

export const runAgentTask = task({
  id: "run-agent",
  maxDuration: 300,
  run: async (payload: RunAgentTaskProps, { ctx }) => {
    const { agentId, agentExecutionContext } = payload;

    return executeAgent(agentId, agentExecutionContext);
  },
});
