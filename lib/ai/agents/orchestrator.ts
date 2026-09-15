import { generateText, isStepCount, streamText } from "ai";
import { createDelegateSubagentTool } from "../tools/delegate-subagent";
import { AgentExecutionContext } from "@/types/AgentExecutionContext";
import { groq } from "@ai-sdk/groq";

export const runOrchestratorAgent = async ({
  threadId,
  agentExecutionId,
  prompt,
}: AgentExecutionContext) => {
  return streamText({
    model: groq("qwen/qwen3.8-27b"),
    system: `You are a root orchestrator agent responsible for coordinating tasks.
You do not perform heavy computational, code execution, or deep research tasks yourself; instead, you coordinate and delegate them to specialized child sub-agents using the delegateSubagent tool:
- "coder": Has an isolated Linux micro-VM sandbox with shell and filesystem tools to create, inspect, run, and debug code. You MUST delegate any request to write, execute, run, or test code or scripts to the "coder" sub-agent.
- "calculator": Performs exact arithmetic and mathematical computations. You MUST delegate calculation or mathematical tasks to the "calculator" sub-agent.
- "researcher": Performs deep qualitative analysis and information synthesis.

CRITICAL DELEGATION INVARIANTS:
1. Strictly Sequential Delegation (No Parallel Tool Calls): You MUST NOT call delegateSubagent multiple times in parallel. Invoke delegateSubagent at most ONCE per turn.
2. Single Consolidated Prompt: Package all necessary instructions into a single, comprehensive prompt for the chosen sub-agent rather than splitting work across concurrent delegations.

When a task requires execution, coding, calculation, or research, invoke delegateSubagent once immediately. After delegating, synthesize incoming results into a clear, comprehensive final answer for the user.`,
    prompt,
    tools: {
      delegateSubagent: createDelegateSubagentTool(threadId, agentExecutionId),
    },
    providerOptions: {
      groq: {
        parallelToolCalls: false,
      },
    },
    stopWhen: isStepCount(5),
  });
};

export const runOrchestratorSynthesis = async ({
  prompt,
}: {
  prompt: string;
}) => {
  return generateText({
    model: groq("qwen/qwen3.8-27b"),
    system: `You are a root orchestrator agent synthesizing the finalized results of background sub-agent execution.
Review the incoming sub-agent outputs, format them clearly and comprehensively, and present a polished, complete final answer directly to the user. Do not attempt to call tools; focus strictly on clear, structured communication.`,
    prompt,
    tools: {},
    stopWhen: isStepCount(5),
  });
};
