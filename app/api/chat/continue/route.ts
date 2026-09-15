import { runOrchestratorAgent } from "@/lib/ai/agents/orchestrator";
import { db } from "@/lib/db";
import { agentExecutions, messages } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.TRIGGER_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { success, agentId, threadId, executionId, status, output } = body;

  const prompt = `${agentId} agent has finished running its background job with success ${success}, status {${status}}, and output {${output}}`;

  const [agentExecution] = await db
    .insert(agentExecutions)
    .values({
      agentId: "orchestrator",
      prompt,
      input: body,
    })
    .returning();

  const result = await runOrchestratorAgent({
    threadId,
    agentExecutionId: executionId,
    prompt,
  });

  const fullText = await result.text;

  await db.update(agentExecutions).set({
    status: "completed",
    output: fullText,
    completedAt: new Date(),
  });

  // const [lastMessage] = await db
  //   .select()
  //   .from(messages)
  //   .where(eq(messages.threadId, threadId))
  //   .orderBy(desc(messages.createdAt))
  //   .limit(1);

  // await db
  //   .update(messages)
  //   .set({
  //     content: lastMessage.content + "\n\n" + fullText,
  //   })
  //   .where(eq(messages.id, lastMessage.id));

  await db.insert(messages).values({
    threadId,
    role: "assistant",
    content: fullText,
  });

  return NextResponse.json({
    success: true,
    executionId: agentExecution.id,
    text: fullText,
  });
}
