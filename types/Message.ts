import { Role } from "./Role";
import { ToolExecution } from "./ToolExecution";

export interface MessageMetadata {
  toolExecutions?: ToolExecution[];
  [key: string]: any;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  metadata?: MessageMetadata | null;
}
