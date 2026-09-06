import { ToolExecution } from "./ToolExecution";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: Record<string, any>;
  toolExecutions?: ToolExecution[];
}
