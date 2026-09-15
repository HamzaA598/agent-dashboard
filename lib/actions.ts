"use server";

import { agentExecutions, messages, threads } from "./db/schema";
import { db } from "./db";
import { AgentRole } from "@/types/AgentRole";
import { count, eq, asc, desc } from "drizzle-orm";
import { Message, MessageMetadata } from "@/types/Message";
import { testRunTask } from "@/trigger/test-run";

export const getThreadMessages = async (
  threadId: string,
): Promise<Message[]> => {
  const dbMessages = await db
    .select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      metadata: messages.metadata,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.threadId, threadId))
    .orderBy(asc(messages.createdAt));

  return dbMessages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    metadata: (m.metadata as MessageMetadata) ?? undefined,
  }));
};

export const getThreadsByAgent = async (agentId?: AgentRole) => {
  return await db
    .select({
      id: threads.id,
      title: threads.title,
      activeAgentId: threads.activeAgentId,
      status: threads.status,
      createdAt: threads.createdAt,
    })
    .from(threads)
    .where(agentId ? eq(threads.activeAgentId, agentId) : undefined)
    .orderBy(desc(threads.createdAt))
    .limit(20);
};

export const getClusterMetrics = async () => {
  const [
    [{ count: executionsCount }],
    [{ count: threadsCount }],
    [{ count: messagesCount }],
  ] = await Promise.all([
    db.select({ count: count() }).from(agentExecutions),
    db.select({ count: count() }).from(threads),
    db.select({ count: count() }).from(messages),
  ]);

  return {
    totalExecutions: Number(executionsCount),
    totalThreads: Number(threadsCount),
    totalMessages: Number(messagesCount),
  };
};

export const triggerTestRun = async (
  agentId: AgentRole,
  prompt: string,
  input: string,
) => {
  const [agentExecution] = await db
    .insert(agentExecutions)
    .values({
      agentId,
      prompt,
      input,
      status: "executing",
    })
    .returning();

  testRunTask.trigger({ agentExecutionId: agentExecution.id });
};
