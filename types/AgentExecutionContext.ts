import { Tool } from "ai";
import { TaskHandoffContext } from "./TaskHandoff";

export interface AgentExecutionContext {
  threadId: string;
  agentExecutionId: string;
  prompt: string;
  input?: Record<string, any>;
  handoff?: TaskHandoffContext;
  tools?: Record<string, Tool>;
}
