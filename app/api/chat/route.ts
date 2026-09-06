import { runAgent } from "@/lib/ai/agent";
import { db } from "@/lib/db";
import { messages, threads } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const POST = async (req: Request) => {
  const { prompt, threadId } = await req.json();

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
        activeAgentId: "google gemini flash 3.5",
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
        // Iterate over text tokens as the model generates them
        for await (const chunk of result.textStream) {
          assistantMessageContent += chunk;
          const payload = JSON.stringify({ text: chunk });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
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
