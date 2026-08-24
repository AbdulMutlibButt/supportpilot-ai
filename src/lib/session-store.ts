import { createHash, randomBytes } from "crypto";
import type { PrismaClient } from "@prisma/client";

export const hashSessionToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function persistSession(client: PrismaClient, userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  await client.session.create({ data: { userId, tokenHash: hashSessionToken(token), expiresAt } });
  return { token, expiresAt };
}

export async function findSession(client: PrismaClient, token: string) {
  return client.session.findFirst({ where: { tokenHash: hashSessionToken(token), expiresAt: { gt: new Date() } }, include: { user: true } });
}

export async function revokeSession(client: PrismaClient, token: string) {
  await client.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
}
