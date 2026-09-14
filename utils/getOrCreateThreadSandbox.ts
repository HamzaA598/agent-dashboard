import { db } from "@/lib/db";
import { threads } from "@/lib/db/schema";
import Sandbox from "@e2b/code-interpreter";
import { eq } from "drizzle-orm";

export const getOrCreateThreadSandbox = async (
  threadId: string,
): Promise<Sandbox> => {
  const [thread] = await db
    .select()
    .from(threads)
    .where(eq(threads.id, threadId));

  let sandbox: Sandbox | null = null;

  if (thread && thread.activeSandboxId) {
    try {
      sandbox = await Sandbox.connect(thread.activeSandboxId);
    } catch {}
  }

  if (!sandbox) {
    sandbox = await Sandbox.create();
    await db
      .update(threads)
      .set({
        activeSandboxId: sandbox.sandboxId,
      })
      .where(eq(threads.id, threadId));
  }

  return sandbox;
};
