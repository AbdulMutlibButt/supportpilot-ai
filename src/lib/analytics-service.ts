import "server-only";
import type { PrismaClient } from "@prisma/client";
import { authorizeWorkspace } from "./authorization";
import { workspaceUsage } from "./plan-service";

export async function workspaceAnalytics(db: PrismaClient, userId: string, workspaceId: string) {
  if (!(await authorizeWorkspace(db, userId, workspaceId, "VIEWER"))) {
    throw new Error("Analytics access denied");
  }

  const since = new Date(Date.now() - 30 * 86_400_000);
  // Avoid exhausting the connection budget of low-resource local PostgreSQL instances.
  const total = await db.conversation.count({ where: { workspaceId, createdAt: { gte: since } } });
  const resolved = await db.conversation.findMany({
    where: { workspaceId, resolvedAt: { gte: since } },
    select: { createdAt: true, resolvedAt: true },
  });
  const messages = await db.message.groupBy({
    by: ["authorType"],
    where: { conversation: { workspaceId }, createdAt: { gte: since } },
    _count: true,
  });
  const escalations = await db.customerChatSession.count({
    where: { workspaceId, escalatedAt: { gte: since } },
  });
  const feedback = await db.aIFeedback.groupBy({
    by: ["value"],
    where: { response: { workspaceId }, createdAt: { gte: since } },
    _count: true,
  });
  const knowledgeActivity = await db.documentActivity.count({
    where: { workspaceId, createdAt: { gte: since } },
  });
  const usage = await workspaceUsage(db, workspaceId);
  const resolutionMinutes = resolved.length
    ? Math.round(
        resolved.reduce(
          (sum, conversation) =>
            sum + (conversation.resolvedAt!.getTime() - conversation.createdAt.getTime()) / 60_000,
          0,
        ) / resolved.length,
      )
    : null;

  return {
    total,
    resolved: resolved.length,
    resolutionMinutes,
    messages: Object.fromEntries(messages.map((item) => [item.authorType, item._count])) as Record<string, number>,
    escalations,
    feedback: Object.fromEntries(feedback.map((item) => [item.value, item._count])) as Record<string, number>,
    knowledgeActivity,
    usage,
  };
}
