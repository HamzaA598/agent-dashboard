import { isStepCount, streamText } from "ai";
import { google } from "../llms/google";
import { createDelegateSubagentTool } from "../tools/delegate-subagent";
import { AgentExecutionContext } from "@/types/AgentExecutionContext";
import Sandbox from "@e2b/code-interpreter";

export const runOrchestratorAgent = async ({
  agentExecutionId,
  prompt,
  input,
}: AgentExecutionContext) => {
  let sandbox: Sandbox | null = null;

  const getOrCreateSandbox = async () => {
    if (!sandbox) sandbox = await Sandbox.create();
    return sandbox;
  };

  const cleanup = async () => {
    if (sandbox) {
      await sandbox.kill();
      sandbox = null;
    }
  };

  return streamText({
    model: google("gemini-3.6-flash"),
    system:
      "You are a root orchestrator agent responsible for coordinating complex tasks. Analyze objectives, formulate plans, and delegate specialized sub-tasks to child sub-agents using delegateSubagent. Synthesize incoming results to achieve the overarching goal.",
    prompt,
    tools: {
      delegateSubagent: createDelegateSubagentTool(
        agentExecutionId,
        getOrCreateSandbox,
      ),
    },
    stopWhen: isStepCount(5),
    onFinish: cleanup,
    onError: cleanup,
  });
};
