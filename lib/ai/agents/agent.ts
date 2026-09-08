import { isStepCount, streamText } from "ai";
import { sampleTool } from "@/lib/ai/tools/sample-tool";
import { calculator } from "../tools/calculator";
import { google } from "../llms/google";

interface AgentParams {
  input: string;
}

export const runAgent = ({ input }: AgentParams) => {
  return streamText({
    model: google("gemini-3.6-flash"),
    system:
      "You are a helpful conversational AI assistant with tool-calling capabilities. Respond clearly and invoke available tools when calculations or actions are required.",
    prompt: input,
    tools: {
      sampleTool,
      calculator,
    },
    stopWhen: isStepCount(5),
  });
};
