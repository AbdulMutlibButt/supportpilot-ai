import "dotenv/config";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { compare } from "bcryptjs";
import { authenticate, createAccount } from "./auth-service";
import { authorizeWorkspace } from "./authorization";
import { findSession, hashSessionToken, persistSession, revokeSession } from "./session-store";

const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const marker = `verify-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const email = (name: string) => `${marker}-${name}@example.test`;
const password = "SecurePass123";
let ownerId = "";
let workspaceId = "";

beforeAll(async () => { await client.$connect(); });
afterAll(async () => { await client.user.deleteMany({ where: { email: { startsWith: marker } } }); await client.workspace.deleteMany({ where: { slug: { startsWith: marker } } }); await client.$disconnect(); });

describe("database authentication", () => {
  it("registers a user, workspace, and owner membership with a bcrypt hash", async () => {
    const result = await createAccount(client, { name: "Verification Owner", email: email("owner"), password, workspace: marker });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    ownerId = result.user.id;
    const stored = await client.user.findUniqueOrThrow({ where: { id: ownerId }, include: { memberships: { include: { workspace: true } } } });
    workspaceId = stored.memberships[0].workspaceId;
    expect(stored.memberships[0].role).toBe("OWNER");
    expect(stored.memberships[0].workspace.name).toBe(marker);
    expect(stored.passwordHash).not.toBe(password);
    expect(await compare(password, stored.passwordHash)).toBe(true);
  });

  it("prevents duplicate email registration", async () => {
    const duplicate = await createAccount(client, { name: "Duplicate", email: email("owner"), password, workspace: `${marker}-duplicate` });
    expect(duplicate).toEqual({ ok: false, reason: "DUPLICATE_EMAIL" });
    expect(await client.user.count({ where: { email: email("owner") } })).toBe(1);
  });

  it("accepts the correct login and rejects invalid credentials", async () => {
    expect((await authenticate(client, email("owner"), password))?.id).toBe(ownerId);
    expect(await authenticate(client, email("owner"), "WrongPass123")).toBeNull();
    expect(await authenticate(client, email("missing"), password)).toBeNull();
  });

  it("persists only a hashed session token and revokes it on logout", async () => {
    const { token } = await persistSession(client, ownerId);
    const stored = await client.session.findFirstOrThrow({ where: { userId: ownerId } });
    expect(stored.tokenHash).toBe(hashSessionToken(token));
    expect(stored.tokenHash).not.toBe(token);
    expect((await findSession(client, token))?.userId).toBe(ownerId);
    await revokeSession(client, token);
    expect(await findSession(client, token)).toBeNull();
  });
});

describe("database workspace authorization", () => {
  it("enforces owner, agent, and viewer permissions on the server", async () => {
    const agent = await client.user.create({ data: { name: "Agent", email: email("agent"), passwordHash: "test-only" } });
    const viewer = await client.user.create({ data: { name: "Viewer", email: email("viewer"), passwordHash: "test-only" } });
    await client.membership.createMany({ data: [{ userId: agent.id, workspaceId, role: "AGENT" }, { userId: viewer.id, workspaceId, role: "VIEWER" }] });
    expect(await authorizeWorkspace(client, ownerId, workspaceId, "OWNER")).not.toBeNull();
    expect(await authorizeWorkspace(client, agent.id, workspaceId, "AGENT")).not.toBeNull();
    expect(await authorizeWorkspace(client, agent.id, workspaceId, "OWNER")).toBeNull();
    expect(await authorizeWorkspace(client, viewer.id, workspaceId, "VIEWER")).not.toBeNull();
    expect(await authorizeWorkspace(client, viewer.id, workspaceId, "AGENT")).toBeNull();
  });

  it("blocks access to another workspace", async () => {
    const other = await client.workspace.create({ data: { name: "Other Workspace", slug: `${marker}-other` } });
    expect(await authorizeWorkspace(client, ownerId, other.id, "VIEWER")).toBeNull();
  });
});
