import { ToolCall } from "./ToolCall";
import { ToolResult } from "./ToolResult";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}
