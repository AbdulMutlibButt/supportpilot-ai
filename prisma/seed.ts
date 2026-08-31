import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const seedPassword = process.env.SEED_PASSWORD;
if (!seedPassword || seedPassword.length < 8) throw new Error("Set SEED_PASSWORD to at least 8 characters before seeding.");
const passwordHash = await hash(seedPassword, 12);
const workspace = await db.workspace.upsert({ where: { slug: "northstar-support" }, update: { plan: "PRO" }, create: { name: "Northstar Support", slug: "northstar-support", plan: "PRO" } });
for (const [email, name, role] of [["owner@supportpilot.local", "Alex Morgan", "OWNER"], ["agent@supportpilot.local", "Mina Kapoor", "AGENT"], ["viewer@supportpilot.local", "Ari Reed", "VIEWER"]] as const) {
  const user = await db.user.upsert({ where: { email }, update: {}, create: { email, name, passwordHash } });
  await db.membership.upsert({ where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } }, update: { role }, create: { userId: user.id, workspaceId: workspace.id, role } });
}
const owner = await db.user.findUniqueOrThrow({ where: { email: "owner@supportpilot.local" } });
const agent = await db.user.findUniqueOrThrow({ where: { email: "agent@supportpilot.local" } });
const billing = await db.tag.upsert({ where: { workspaceId_name: { workspaceId: workspace.id, name: "Billing" } }, update: {}, create: { workspaceId: workspace.id, name: "Billing", color: "#f59e0b" } });
const setup = await db.tag.upsert({ where: { workspaceId_name: { workspaceId: workspace.id, name: "Setup" } }, update: {}, create: { workspaceId: workspace.id, name: "Setup", color: "#6558f5" } });
if (await db.conversation.count({ where: { workspaceId: workspace.id } }) === 0) {
  for (const item of [
    { name: "Sarah Mitchell", email: "sarah@example.test", subject: "Unable to access my account", body: "I changed phones and can no longer access my account. Can you help?", priority: "URGENT" as const, tagId: setup.id },
    { name: "Daniel Kim", email: "daniel@example.test", subject: "Question about our latest invoice", body: "The latest invoice includes a charge I do not recognize.", priority: "HIGH" as const, tagId: billing.id },
    { name: "Priya Nair", email: "priya@example.test", subject: "Help setting up team permissions", body: "What is the best role for teammates who only need reports?", priority: "NORMAL" as const, tagId: setup.id },
  ]) {
    const customer = await db.customer.create({ data: { workspaceId: workspace.id, name: item.name, email: item.email } });
    const conversation = await db.conversation.create({ data: { workspaceId: workspace.id, customerId: customer.id, subject: item.subject, priority: item.priority, messages: { create: { authorType: "CUSTOMER", customerId: customer.id, body: item.body } }, tags: { create: { tagId: item.tagId } }, assignment: { create: { agentId: agent.id, assignedById: owner.id } } } });
    await db.activityEvent.create({ data: { workspaceId: workspace.id, conversationId: conversation.id, actorId: owner.id, type: "conversation.created", description: `Created conversation “${item.subject}”` } });
  }
}
const gettingStarted = await db.knowledgeCollection.upsert({
  where: { workspaceId_name: { workspaceId: workspace.id, name: "Getting started" } },
  update: {},
  create: { workspaceId: workspace.id, name: "Getting started", description: "Core product and support guidance" },
});
if (await db.knowledgeDocument.count({ where: { workspaceId: workspace.id } }) === 0) {
  const document = await db.knowledgeDocument.create({
    data: {
      workspaceId: workspace.id, creatorId: owner.id, collectionId: gettingStarted.id,
      title: "Welcome to Northstar Support", description: "A sample manual knowledge article.", sourceType: "ARTICLE", status: "READY",
      chunks: { create: { position: 0, section: "Article", content: "Northstar Support helps teams resolve customer questions consistently. Add trusted product guidance here for agents and viewers." } },
    },
  });
  await db.documentActivity.create({ data: { workspaceId: workspace.id, documentId: document.id, actorId: owner.id, type: "article.created", description: "Created sample knowledge article" } });
}
if (!await db.knowledgeDocument.findFirst({ where: { workspaceId: workspace.id, title: "Returns and account access" } })) {
  const document = await db.knowledgeDocument.create({ data: { workspaceId: workspace.id, creatorId: owner.id, collectionId: gettingStarted.id, title: "Returns and account access", description: "Seed content for grounded-answer evaluation.", sourceType: "ARTICLE", status: "READY", chunks: { create: [
    { position: 0, section: "Returns", content: "Customers may return unused products within 30 days of delivery. Products must be in their original packaging and include proof of purchase." },
    { position: 1, section: "Account access", content: "Customers who lose access after changing phones should contact support for identity verification and an account recovery link." },
  ] } } });
  await db.documentActivity.create({ data: { workspaceId: workspace.id, documentId: document.id, actorId: owner.id, type: "article.created", description: "Created evaluation knowledge article" } });
}
await db.chatbotConfig.upsert({ where: { workspaceId: workspace.id }, update: {}, create: { workspaceId: workspace.id, name: "Northstar Assistant", welcomeMessage: "Hi! Ask a question about Northstar support.", color: "#6558f5" } });
await db.$disconnect();
console.log("Seeded SupportPilot members, conversations, knowledge content, and chatbot configuration.");
