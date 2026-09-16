import { runOrchestratorSynthesis } from "@/lib/ai/agents/orchestrator";
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

  const formattedOutput =
    typeof output === "string" ? output : JSON.stringify(output, null, 2);

  const prompt = `## Sub-Agent Execution Completion Report

### Execution Metadata
- **Sub-Agent Role:** ${agentId}
- **Execution ID:** ${executionId}
- **Execution Status:** ${status}
- **Task Success:** ${success ? "COMPLETED" : "FAILED / INCOMPLETE"}

### Sub-Agent Deliverables & Raw Output
\`\`\`
${formattedOutput}
\`\`\`

### Orchestrator Synthesis Directives
1. **Direct Communication:** Present the final answer directly to the user as the primary orchestrator. Do NOT use third-person meta-narratives (e.g., avoid "The coder agent reported that...").
2. **Deliverables & Formatting:** Highlight key outcomes, mathematical results, or file modifications. Format all code, diffs, and terminal outputs in clean, syntax-highlighted Markdown code blocks.
3. **Failure Diagnostics:** If the task failed or completed partially, explain the specific failure mode clearly and outline actionable next steps for the user.`;

  const [agentExecution] = await db
    .insert(agentExecutions)
    .values({
      agentId: "orchestrator",
      prompt,
      input: body,
    })
    .returning();

  const result = await runOrchestratorSynthesis({
    prompt,
  });

  const fullText = result.text;

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
