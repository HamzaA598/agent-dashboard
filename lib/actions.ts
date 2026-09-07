"use server";

import { mockAgents } from "@/data/mockAgents";
import { helloWorldTask } from "@/trigger/example";
import { AgentStatus } from "@/types/AgentStatus";
import { delay } from "@/utils/delay";
import { revalidatePath } from "next/cache";

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

export const triggerTestRun = async (agentId: string) => {
  helloWorldTask.trigger(agentId);
};
