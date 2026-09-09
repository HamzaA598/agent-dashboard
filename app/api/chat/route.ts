import { runAgent } from "@/lib/ai/agents/agent";
import { runOrchestratorAgent } from "@/lib/ai/agents/orchestrator";
import { db } from "@/lib/db";
import { agentExecutions, messages, threads } from "@/lib/db/schema";
import { ToolExecution } from "@/types/ToolExecution";
import { and, eq } from "drizzle-orm";

export const POST = async (req: Request) => {
  const { agentId, threadId, prompt } = await req.json();

  // const callerWorkspaceId = session.user.activeWorkspaceId;

  const [thread] = await db
    .select()
    .from(threads)
    .where(
      and(
        eq(threads.id, threadId),
        // eq(threads.workspaceId, callerWorkspaceId)
      ),
    );

  if (!thread) {
    const [thread] = await db
      .insert(threads)
      .values({
        id: threadId,
        title: prompt,
        activeAgentId: agentId,
        status: "active",
      })
      .returning();
  }

  const [userMessage] = await db
    .insert(messages)
    .values({
      threadId: threadId,
      role: "user",
      content: prompt,
    })
    .returning();

  const [agentExecution] = await db
    .insert(agentExecutions)
    .values({
      agentId: "orchestrator",
    })
    .returning();

  const result = runOrchestratorAgent({
    agentExecutionId: agentExecution.id,
    prompt,
  });

  const encoder = new TextEncoder();

  const metadata: { toolExecutions: ToolExecution[] } = { toolExecutions: [] };
  let assistantMessageContent = "";

  // 2. Wrap in ReadableStream matching our frontend SSE contract
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of result.stream) {
          if (["tool-call", "tool-result", "text-delta"].includes(part.type)) {
            let payload = {};

            if (part.type === "tool-call") {
              const toolExecution: ToolExecution = {
                id: part.toolCallId,
                toolName: part.toolName,
                input: part.input,
                status: "pending",
              };

              metadata["toolExecutions"].push(toolExecution);
              payload = { ...toolExecution, type: part.type };
            }

            if (part.type === "tool-result") {
              metadata["toolExecutions"] = metadata["toolExecutions"].map(
                (toolExecution) => {
                  if (toolExecution.id === part.toolCallId) {
                    const newToolExecution: ToolExecution = {
                      ...toolExecution,
                      output: part.output,
                      status: "success",
                    };
                    payload = { ...newToolExecution, type: part.type };
                    return newToolExecution;
                  }
                  return toolExecution;
                },
              );
            }

            if (part.type === "text-delta") {
              assistantMessageContent += part.text;
              payload = { text: part.text, type: part.type };
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
            );
          }
        }
        // Send our termination token
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        controller.error(err);
      } finally {
        const [assistantMessage] = await db
          .insert(messages)
          .values({
            threadId: threadId,
            role: "assistant",
            content: assistantMessageContent,
            metadata,
          })
          .returning();

        if (agentExecution) {
          await db
            .update(agentExecutions)
            .set({
              status: "completed",
              completedAt: new Date(),
            })
            .where(eq(agentExecutions.id, agentExecution.id));
        }

        controller.close();
      }
    },
  });

  // 3. Return standard SSE HTTP response
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
