import { ModelMessage, Tool } from "ai";
import { TaskHandoffContext } from "./TaskHandoff";

/**
 * Common infrastructure envelope for all agent executions (persistence IDs, telemetry, tools).
 */
export interface BaseExecutionContext {
  threadId: string;
  agentExecutionId: string;
  input?: Record<string, any>;
  handoff?: TaskHandoffContext;
  tools?: Record<string, Tool>;
}

/**
 * Worker execution contract: strictly single-turn task instruction.
 * Dedicated to isolated worker sub-agents (coder, calculator, researcher).
 */
export interface WorkerExecutionContext extends BaseExecutionContext {
  prompt: string;
}

/**
 * Orchestrator execution contract: strictly multi-turn conversational message stack.
 * Dedicated to the root conversational orchestrator agent.
 */
export interface OrchestratorExecutionContext extends BaseExecutionContext {
  messages: ModelMessage[];
}

/**
 * Union for generic dispatchers, telemetry logging, and database runners.
 */
export type AgentExecutionContext =
  | WorkerExecutionContext
  | OrchestratorExecutionContext;
