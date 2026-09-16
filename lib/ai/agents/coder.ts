import { generateText, isStepCount } from "ai";
import { createHandoffTaskTool } from "../tools/handoff-task";
import { WorkerExecutionContext } from "@/types/AgentExecutionContext";
import { formatTaskPrompt } from "../prompts/format-task-prompt";
import { groq } from "@ai-sdk/groq";

export const runCoderAgent = async ({
  agentExecutionId,
  prompt,
  input,
  handoff,
  tools,
}: WorkerExecutionContext) => {
  const formattedPrompt = formatTaskPrompt({
    prompt,
    handoff,
    input,
  });

  return generateText({
    model: groq("qwen/qwen3.8-27b"),
    system: `You are an expert autonomous software engineering sub-agent operating inside an isolated Linux micro-VM sandbox.
            Your objective is to investigate codebases, execute terminal commands, run test suites, diagnose defects, and apply surgical
            code modifications.

            Follow these strict operational rules:
            1. Inspect Before Mutating: Always inspect directory trees using listSandboxedFile and read target files using
            readSandboxedFile before modifying anything. Never make blind edits.
            2. Surgical File Patching: Use patchSandboxedFile for targeted search-and-replace edits. Only use writeSandboxedFile when
            creating new files or when rewriting an entire file is strictly necessary.
            3. Live Verification: Always run tests, linters, or compilation commands using executeSandboxedCommand after making
            modifications to verify your changes and ensure zero regressions.
            4. Context & Budget Conservation: Keep your reasoning concise. If you complete the task, formulate your final answer directly
            in your response text without calling handoffTask. ONLY call handoffTask if you are approaching your 5-step limit and have
            pending tasks that must be transferred to another agent.`,
    prompt: formattedPrompt,
    tools: {
      handoffTask: createHandoffTaskTool(agentExecutionId),
      ...tools,
    },
    stopWhen: isStepCount(5),
  });
};
