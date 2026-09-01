import { AgentConfig } from "./AgentConfig";
import { AgentLog } from "./AgentLog";
import { AgentStatus } from "./AgentStatus";

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  description: string;
  capabilities: string[];
  logs: AgentLog[];
  config: AgentConfig;
}
