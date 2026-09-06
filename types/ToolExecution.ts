export interface ToolExecution {
  id: string;
  toolName: string;
  input: unknown;
  output?: unknown;
  status: "pending" | "success" | "error";
}
