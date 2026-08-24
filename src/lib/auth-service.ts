import { compare, hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { Prisma, type PrismaClient, type User } from "@prisma/client";

export type RegistrationInput = { name: string; email: string; password: string; workspace: string };
export type RegistrationResult = { ok: true; user: User } | { ok: false; reason: "DUPLICATE_EMAIL" };
const DUMMY_HASH = "$2b$12$0JqLyFH14GOq2kzbhfPLNeZQDB2xyfWZQwLrG3.jB8YrgIMj5BAmq";

export async function createAccount(client: PrismaClient, input: RegistrationInput): Promise<RegistrationResult> {
  const passwordHash = await hash(input.password, 12);
  const slug = `${input.workspace.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${randomBytes(4).toString("hex")}`;
  try {
    const user = await client.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { name: input.name, email: input.email, passwordHash } });
      const workspace = await tx.workspace.create({ data: { name: input.workspace, slug } });
      await tx.membership.create({ data: { userId: created.id, workspaceId: workspace.id, role: "OWNER" } });
      return created;
    });
    return { ok: true, user };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { ok: false, reason: "DUPLICATE_EMAIL" };
    throw error;
  }
}

export async function authenticate(client: PrismaClient, email: string, password: string) {
  const user = await client.user.findUnique({ where: { email } });
  const valid = await compare(password, user?.passwordHash ?? DUMMY_HASH);
  return user && valid ? user : null;
}
