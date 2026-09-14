import { isStepCount, streamText } from "ai";
import { google } from "../llms/google";
import { createDelegateSubagentTool } from "../tools/delegate-subagent";
import { AgentExecutionContext } from "@/types/AgentExecutionContext";

export const runOrchestratorAgent = async ({
  threadId,
  agentExecutionId,
  prompt,
}: AgentExecutionContext) => {
  return streamText({
    model: google("gemini-3.6-flash"),
    system:
      "You are a root orchestrator agent responsible for coordinating complex tasks. Analyze objectives, formulate plans, and delegate specialized sub-tasks to child sub-agents using delegateSubagent. Synthesize incoming results to achieve the overarching goal.",
    prompt,
    tools: {
      delegateSubagent: createDelegateSubagentTool(threadId, agentExecutionId),
    },
    stopWhen: isStepCount(5),
  });
};
