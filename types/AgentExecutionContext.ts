import { TaskHandoffContext } from "./TaskHandoff";

export interface AgentExecutionContext {
  agentExecutionId: string;
  prompt: string;
  input?: Record<string, any>;
  handoff?: TaskHandoffContext;
}
