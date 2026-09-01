export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
}
