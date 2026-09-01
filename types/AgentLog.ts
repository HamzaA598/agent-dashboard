export interface AgentLog {
  timestamp: string;
  event: string;
  type: "info" | "success" | "warning";
}
