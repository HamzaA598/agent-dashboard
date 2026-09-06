import { runAgent } from "@/lib/ai/agent";
import { db } from "@/lib/db";
import { messages, threads } from "@/lib/db/schema";
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

  const result = runAgent({ input: prompt });

  const encoder = new TextEncoder();

  let assistantMessageContent = "";

  // 2. Wrap in ReadableStream matching our frontend SSE contract
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of result.stream) {
          console.log(`route.ts part: `, part);
          if (["tool-call", "tool-result", "text-delta"].includes(part.type)) {
            const payload = JSON.stringify(part);
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));

            if (part.type === "text-delta")
              assistantMessageContent += part.text;
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
          })
          .returning();
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
