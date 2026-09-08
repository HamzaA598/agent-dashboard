import { db } from "@/lib/db";
import { agentExecutions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;

  const agentId = searchParams.get("agentId") ?? "";

  const logs = await db
    .select()
    .from(agentExecutions)
    .where(and(eq(agentExecutions.agentId, agentId)));

  return Response.json({
    data: logs,
    status: "success",
  });
};
