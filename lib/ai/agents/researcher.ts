import { generateText, isStepCount } from "ai";
import { sampleTool } from "@/lib/ai/tools/sample-tool";
import { calculator } from "../tools/calculator";
import { google } from "../llms/google";
import { createHandoffTaskTool } from "../tools/handoff-task";
import { AgentExecutionContext } from "@/types/AgentExecutionContext";
import { formatTaskPrompt } from "../prompts/format-task-prompt";

export const runResearcherAgent = ({
  agentExecutionId,
  prompt,
  input,
  handoff,
}: AgentExecutionContext) => {
  const formattedPrompt = formatTaskPrompt({
    prompt,
    handoff,
    input,
  });

  return generateText({
    model: google("gemini-3.6-flash"),
    system:
      "You are a specialized researcher sub-agent responsible for investigating tasks, searching data, and performing calculations. Work step-by-step using your available tools. If you have completed your investigation or approach your 5-step execution limit, call handoffTask to persist a checkpoint summarizing your findings, completed checklist items, and remaining pending tasks.",
    prompt: formattedPrompt,
    tools: {
      sampleTool,
      calculator,
      handoffTask: createHandoffTaskTool(agentExecutionId),
    },
    stopWhen: isStepCount(5),
  });
};
