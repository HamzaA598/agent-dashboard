export const AGENT_ROLES = ["orchestrator", "researcher"] as const;

export type AgentRole = (typeof AGENT_ROLES)[number];
