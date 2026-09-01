import "server-only";
import { mockAgents } from "@/data/mockAgents";
import { Agent } from "@/types/Agent";
import { TokenMetrics } from "@/types/TokenMetrics";
import { delay } from "@/utils/delay";

export const getAgents = async (): Promise<Agent[]> => {
  await delay(200);
  return mockAgents;
};

export const getAgentById = async (id: string): Promise<Agent | undefined> => {
  await delay(300);
  return mockAgents.find((agent) => agent.id === id);
};

export const getTokenMetrics = async (): Promise<TokenMetrics> => {
  await delay(1500);
  return { totalTokens: 142500, estimatedCost: "$2.85", activeStreams: 4 };
};
