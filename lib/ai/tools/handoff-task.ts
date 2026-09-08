import { db } from "@/lib/db";
import { taskHandoffs } from "@/lib/db/schema";
import { tool } from "ai";
import { z } from "zod";

export const handoffTask = tool({
  description:
    "Persist an in-progress task checkpoint and hand off execution to the next agent. Call this tool when concluding your phase or nearing your step limit, providing a dense summary of findings, completed work, and remaining pending tasks.",
  inputSchema: z.object({
    fromExecutionId: z
      .string()
      .describe(
        "The execution ID of the agent concluding its phase and handing off this task checkpoint",
      ),
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
    fromExecutionId,
    checkpointSummary,
    completedTasks,
    pendingTasks,
    artifacts,
  }) => {
    const [task_handoff] = await db
      .insert(taskHandoffs)
      .values({
        fromExecutionId,
        completedTasks,
        pendingTasks,
        checkpointSummary,
        artifacts,
      })
      .returning();

    return {
      success: true,
      handoffId: task_handoff.id,
      status: task_handoff.status,
      message:
        "Handoff checkpoint saved successfully. Execution will continue with the next agent.",
    };
  },
});
