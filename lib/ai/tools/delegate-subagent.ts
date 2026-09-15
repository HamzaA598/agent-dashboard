import { db } from "@/lib/db";
import { agentExecutions, taskHandoffs } from "@/lib/db/schema";
import { tool } from "ai";
import { z } from "zod";
import { agentRegistry } from "../agents/registry";
import { and, desc, eq, inArray } from "drizzle-orm";
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
      "Spawn and delegate a sub-task to a specialized child sub-agent. Available agents: 'coder' (runs code, tests scripts, and inspects files in an isolated Linux micro-VM sandbox), 'calculator' (evaluates exact arithmetic and formulas), and 'researcher' (deep qualitative analysis). Call this tool whenever a task requires specialized execution, running code, or exact calculations.",
    inputSchema: z.object({
      agentId: z
        .enum(AGENT_ROLES)
        .describe(
          "The role of the sub-agent to delegate to: 'coder' (code execution/sandboxed work), 'calculator' (math), or 'researcher' (research)",
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
      const [concurrentAgentExecution] = await db
        .select()
        .from(agentExecutions)
        .where(
          and(
            inArray(agentExecutions.status, ["pending", "executing"]),
            eq(agentExecutions.parentExecutionId, parentExecutionId),
          ),
        )
        .orderBy(desc(agentExecutions.createdAt))
        .limit(1);

      if (concurrentAgentExecution != null) {
        const activeRole = concurrentAgentExecution.agentId;
        const activeStatus = concurrentAgentExecution.status;

        return {
          success: false,
          executionId: concurrentAgentExecution.id,
          triggerRunId: concurrentAgentExecution.triggerRunId,
          status: activeStatus,
          output: `[CONCURRENCY_LOCK_ACTIVE]: Delegation rejected. A sub-agent ('${activeRole}', execution ID: ${concurrentAgentExecution.id}) is already actively running with status '${activeStatus}' inside this thread's sandbox. Each thread is strictly restricted to one active sub-agent at a time to prevent sandbox file corruption, command collision, and terminal race conditions. DO NOT retry delegation on this turn. Formulate your response informing the user that the '${activeRole}' task is currently in progress and its output will be delivered once completed.`,
          message: `Delegation rejected: '${activeRole}' is already executing in this thread's sandbox (status: ${activeStatus}).`,
        };
      }

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

      return await executeAgent(agentId, agentExecutionContext);
    },
  });
};
