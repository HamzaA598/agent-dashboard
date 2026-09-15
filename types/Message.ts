import { ToolExecution } from "./ToolExecution";

export interface MessageMetadata {
  toolExecutions?: ToolExecution[];
  [key: string]: any;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: MessageMetadata;
}
