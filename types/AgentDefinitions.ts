import { AgentExecutionContext } from "./AgentExecutionContext";

export interface AgentDefinition<TOutput> {
  name: string;
  description: string;
  run: (ctx: AgentExecutionContext) => TOutput | Promise<TOutput>;
}
