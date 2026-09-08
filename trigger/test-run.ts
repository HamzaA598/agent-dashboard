import { db } from "@/lib/db";
import { agentExecutions } from "@/lib/db/schema";
import { task, wait } from "@trigger.dev/sdk";
import { eq } from "drizzle-orm";

export const testRunTask = task({
  id: "test-run",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: any, { ctx }) => {
    const { agentExecutionId } = payload;

    await wait.for({ seconds: 5 });

    const [updatedAgentExecution] = await db
      .update(agentExecutions)
      .set({
        status: "completed",
        output: "ok",
        completedAt: new Date(),
      })
      .where(eq(agentExecutions.id, agentExecutionId))
      .returning();

    return {
      message: `Tests ran successfully! agent execution id ${updatedAgentExecution.id}`,
    };
  },
});
