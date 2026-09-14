import { db } from "@/lib/db";
import { agentExecutions, taskHandoffs } from "@/lib/db/schema";
import { tool } from "ai";
import { z } from "zod";
import { agentRegistry } from "../agents/registry";
import { and, desc, eq } from "drizzle-orm";
import { AGENT_ROLES } from "@/constants/agent-roles";
import { AgentExecutionContext } from "@/types/AgentExecutionContext";
import { runAgentTask } from "@/trigger/run-agent";
import { executeAgent } from "@/lib/ai/agents/execute-agent";

export const createDelegateSubagentTool = (
  threadId: string,
  parentExecutionId: string,
) => {
  return tool({
    description:
      "Spawn and delegate a sub-task to a specialized child sub-agent. Call this tool when a task requires specialized execution (such as in-depth research or calculations), registering hierarchical lineage under the parent execution.",
    inputSchema: z.object({
      agentId: z
        .enum(AGENT_ROLES)
        .describe(
          "The identifier or role name of the sub-agent to delegate to (e.g., 'researcher')",
        ),
      prompt: z
        .string()
        .describe(
          "Detailed, self-contained task prompt for the sub-agent. Must clearly state the specific objective, any necessary context or constraints, and the expected deliverable format (e.g., bulleted findings, markdown table, or numerical result). Note: the sub-agent has no access to the orchestrator's prior chat history.",
        ),
      input: z
        .record(z.string(), z.any())
        .describe(
          "Input payload, parameters, or structured task instructions provided to the sub-agent",
        ),
    }),
    execute: async ({ agentId, prompt, input }) => {
      const agentDefinition = agentRegistry[agentId];

      const [agentExecution] = await db
        .insert(agentExecutions)
        .values({
          parentExecutionId,
          agentId,
          prompt,
          input,
        })
        .returning();

      const [latestPendingHandoff] = await db
        .select({
          id: taskHandoffs.id,
          checkpointSummary: taskHandoffs.checkpointSummary,
          completedTasks: taskHandoffs.completedTasks,
          pendingTasks: taskHandoffs.pendingTasks,
          artifacts: taskHandoffs.artifacts ?? undefined,
        })
        .from(taskHandoffs)
        .innerJoin(
          agentExecutions,
          eq(taskHandoffs.fromExecutionId, agentExecutions.id),
        )
        .where(
          and(
            eq(agentExecutions.parentExecutionId, parentExecutionId),
            eq(taskHandoffs.status, "pending"),
          ),
        )
        .orderBy(desc(taskHandoffs.createdAt))
        .limit(1);

      if (latestPendingHandoff) {
        await db
          .update(taskHandoffs)
          .set({
            toExecutionId: agentExecution.id,
            status: "consumed",
          })
          .where(eq(taskHandoffs.id, latestPendingHandoff.id));
      }

      const agentExecutionContext: AgentExecutionContext = {
        threadId,
        agentExecutionId: agentExecution.id,
        prompt,
        input,
        handoff: latestPendingHandoff,
      };

      if (agentDefinition.isLongRunning) {
        const { id: triggerRunId } = await runAgentTask.trigger({
          agentId,
          agentExecutionContext,
        });

        return {
          success: true,
          executionId: agentExecution.id,
          triggerRunId,
          status: "pending",
          output: "Sub-agent run has been successfully dispatched to a task.",
          message: "Sub-agent has been dispatched to a task.",
        };
      }

      return executeAgent(agentId, agentExecutionContext);
    },
  });
};
