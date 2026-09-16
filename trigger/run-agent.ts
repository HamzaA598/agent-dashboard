import { WorkerExecutionContext } from "@/types/AgentExecutionContext";
import { AgentRole } from "@/types/AgentRole";
import { executeAgent } from "@/lib/ai/agents/execute-agent";
import { task } from "@trigger.dev/sdk";

interface RunAgentTaskProps {
  agentId: AgentRole;
  agentExecutionContext: WorkerExecutionContext;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const runAgentTask = task({
  id: "run-agent",
  maxDuration: 300,
  run: async (payload: RunAgentTaskProps, { ctx }) => {
    const { agentId, agentExecutionContext } = payload;

    const result = await executeAgent(agentId, agentExecutionContext);

    const response = await fetch(`${baseUrl}/api/chat/continue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TRIGGER_API_KEY}`,
      },
      body: JSON.stringify(result),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const {
      success: calledWebhook,
      executionId: newAgentExecutionId,
      text: newOutput,
    } = await response.json();

    return {
      ...result,
      calledWebhook,
      newAgentExecutionId,
      newOutput,
    };
  },
});
