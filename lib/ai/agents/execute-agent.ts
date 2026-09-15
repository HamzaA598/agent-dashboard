import { Tool } from "ai";
import { getOrCreateThreadSandbox } from "@/utils/getOrCreateThreadSandbox";
import { agentRegistry } from "@/lib/ai/agents/registry";
import { createSandboxTools } from "@/lib/ai/tools/sandbox-tools";
import { db } from "@/lib/db";
import { agentExecutions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AgentRole } from "@/types/AgentRole";
import { AgentExecutionContext } from "@/types/AgentExecutionContext";

export const executeAgent = async (
  agentId: AgentRole,
  agentExecutionContext: AgentExecutionContext,
) => {
  const { agentExecutionId, threadId } = agentExecutionContext;
  const agentDefinition = agentRegistry[agentId];

  let tools: Record<string, Tool> = {};
  if (agentDefinition.requiresSandbox) {
    const sandbox = await getOrCreateThreadSandbox(threadId);
    tools = createSandboxTools(sandbox);
  }

  const updatedAgentExecutionContext = { ...agentExecutionContext, tools };

  const result = await agentDefinition.run(updatedAgentExecutionContext);

  const outputText = result?.text ?? null;

  await db
    .update(agentExecutions)
    .set({
      status: "completed",
      completedAt: new Date(),
      output: outputText ? { text: outputText } : null,
    })
    .where(eq(agentExecutions.id, agentExecutionId));

  return {
    success: true,
    executionId: agentExecutionId,
    agentId,
    threadId,
    triggerRunId: undefined,
    status: "completed",
    output: outputText ?? "Sub-agent executed successfully.",
    message: "Sub-agent executed and completed successfully.",
  };
};
