import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const seedPassword = process.env.SEED_PASSWORD;
if (!seedPassword || seedPassword.length < 8) throw new Error("Set SEED_PASSWORD to at least 8 characters before seeding.");
const passwordHash = await hash(seedPassword, 12);
const workspace = await db.workspace.upsert({ where: { slug: "northstar-support" }, update: {}, create: { name: "Northstar Support", slug: "northstar-support" } });
for (const [email, name, role] of [["owner@supportpilot.local", "Alex Morgan", "OWNER"], ["agent@supportpilot.local", "Mina Kapoor", "AGENT"], ["viewer@supportpilot.local", "Ari Reed", "VIEWER"]] as const) {
  const user = await db.user.upsert({ where: { email }, update: {}, create: { email, name, passwordHash } });
  await db.membership.upsert({ where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } }, update: { role }, create: { userId: user.id, workspaceId: workspace.id, role } });
}
await db.$disconnect();
console.log("Seeded SupportPilot owner, agent, and viewer users.");
