import { generateText, isStepCount } from "ai";
import { sampleTool } from "@/lib/ai/tools/sample-tool";
import { calculator } from "../tools/calculator";
import { createHandoffTaskTool } from "../tools/handoff-task";
import { WorkerExecutionContext } from "@/types/AgentExecutionContext";
import { formatTaskPrompt } from "../prompts/format-task-prompt";
import { groq } from "@ai-sdk/groq";

export const runResearcherAgent = ({
  agentExecutionId,
  prompt,
  input,
  handoff,
}: WorkerExecutionContext) => {
  const formattedPrompt = formatTaskPrompt({
    prompt,
    handoff,
    input,
  });

  return generateText({
    model: groq("qwen/qwen3.8-27b"),
    system:
      "You are a specialized researcher sub-agent responsible for investigating tasks, gathering information, and performing qualitative analysis. Work step-by-step using your available tools. If you complete your investigation, formulate and return your final answer directly in your response text without calling handoffTask. ONLY call handoffTask if you are approaching your 5-step execution limit and still have pending or unfinished tasks to hand off to another agent.",
    prompt: formattedPrompt,
    tools: {
      sampleTool,
      calculator,
      handoffTask: createHandoffTaskTool(agentExecutionId),
    },
    stopWhen: isStepCount(5),
  });
};
