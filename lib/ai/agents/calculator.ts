import { generateText, isStepCount } from "ai";
import { calculator } from "../tools/calculator";
import { createHandoffTaskTool } from "../tools/handoff-task";
import { AgentExecutionContext } from "@/types/AgentExecutionContext";
import { formatTaskPrompt } from "../prompts/format-task-prompt";
import { groq } from "@ai-sdk/groq";

export const runCalculatorAgent = async ({
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
    model: groq("qwen/qwen3.8-27b"),
    system:
      "You are a dedicated mathematical calculation sub-agent specialized in arithmetic, mathematical expressions, numerical evaluations, and formulas. Always use your calculator tool to compute exact values rather than guessing mental math. Present clear, step-by-step arithmetic along with the final exact numerical result. If you complete the calculation, formulate your final answer directly in your response text without calling handoffTask. ONLY call handoffTask if you are approaching your 5-step execution limit and still have pending tasks.",
    prompt: formattedPrompt,
    tools: {
      calculator,
      handoffTask: createHandoffTaskTool(agentExecutionId),
    },
    stopWhen: isStepCount(5),
  });
};
