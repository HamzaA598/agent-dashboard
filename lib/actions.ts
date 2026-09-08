"use server";

import { mockAgents } from "@/data/mockAgents";
import { testRunTask } from "@/trigger/test-run";
import { AgentStatus } from "@/types/AgentStatus";
import { delay } from "@/utils/delay";
import { revalidatePath } from "next/cache";
import { agentExecutions } from "./db/schema";
import { db } from "./db";

export const updateAgentStatus = async (
  id: string,
  newStatus: AgentStatus,
): Promise<void> => {
  await delay(200);
  const idx = mockAgents.findIndex((agent) => agent.id === id);
  mockAgents[idx].status = newStatus;

  revalidatePath(`/agents/${id}`);
  revalidatePath(`/agents`);
};

export const triggerTestRun = async (agentId: string, input: string) => {
  const [agentExecution] = await db
    .insert(agentExecutions)
    .values({
      agentId,
      input,
      status: "executing",
    })
    .returning();

  testRunTask.trigger({ agentExecutionId: agentExecution.id });
};
