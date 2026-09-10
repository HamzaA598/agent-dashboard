import { db } from "@/lib/db";
import { taskHandoffs } from "@/lib/db/schema";
import { tool } from "ai";
import { z } from "zod";

export const createHandoffTaskTool = (agentExecutionId: string) => {
  return tool({
    description:
      "Persist an incomplete task checkpoint to hand off execution to a successor agent. Call this tool ONLY when you are nearing your execution step limit AND still have unfinished objectives or pending tasks. NEVER call this tool if you have completed the task or answered all questions—if the task is complete, directly provide your final findings in your text response.",
    inputSchema: z.object({
      checkpointSummary: z
        .string()
        .describe(
          "Dense qualitative synthesis of what was learned and guidance for the next agent",
        ),
      completedTasks: z
        .array(z.string())
        .describe("Array of strings representing verified tasks"),
      pendingTasks: z
        .array(z.string())
        .describe("Array of strings representing the remaining roadmap"),
      artifacts: z
        .record(z.string(), z.any())
        .optional()
        .describe(
          "Optional JSON object of generated file paths, diffs, or data keys",
        ),
    }),
    execute: async ({
      checkpointSummary,
      completedTasks,
      pendingTasks,
      artifacts,
    }) => {
      const [taskHandoff] = await db
        .insert(taskHandoffs)
        .values({
          fromExecutionId: agentExecutionId,
          completedTasks,
          pendingTasks,
          checkpointSummary,
          artifacts,
        })
        .returning();

      return {
        success: true,
        handoffId: taskHandoff.id,
        status: taskHandoff.status,
        message:
          "Handoff checkpoint saved successfully. Execution will continue with the next agent.",
      };
    },
  });
};
