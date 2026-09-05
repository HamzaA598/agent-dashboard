import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { sampleTool } from "@/lib/ai/tools/sample-tool";

interface AgentParams {
  input: string;
}

export const runAgent = ({ input }: AgentParams) => {
  return streamText({
    model: google("gemini-1.5-flash"),
    system:
      "Generic system instructions defining agent persona and behavioral boundaries.",
    prompt: input,
    tools: {
      sampleTool,
    },
    maxSteps: 5, // Authorizes the multi-step tool-execution loop
  });
};
