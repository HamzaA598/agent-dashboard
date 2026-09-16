import { WorkerExecutionContext } from "./AgentExecutionContext";

export interface AgentDefinition<TOutput = any, TCtx = WorkerExecutionContext> {
  name: string;
  description: string;
  run: (ctx: TCtx) => TOutput | Promise<TOutput>;
  isLongRunning?: boolean;
  requiresSandbox?: boolean;
}
