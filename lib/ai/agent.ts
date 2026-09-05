import { isStepCount, streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { sampleTool } from "@/lib/ai/tools/sample-tool";
import { calculator } from "./tools/calculator";

const google = createGoogleGenerativeAI({
  apiKey:
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

interface AgentParams {
  input: string;
}

export const runAgent = ({ input }: AgentParams) => {
  return streamText({
    model: google("gemini-3.6-flash"),
    system:
      "Generic system instructions defining agent persona and behavioral boundaries.",
    prompt: input,
    tools: {
      sampleTool,
      calculator,
    },
    stopWhen: isStepCount(5),
  });
};
