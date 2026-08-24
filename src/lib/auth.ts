import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { authorizeWorkspace, type WorkspaceRole } from "./authorization";
import { findSession, persistSession, revokeSession } from "./session-store";

const COOKIE = process.env.SESSION_COOKIE_NAME ?? "supportpilot_session";

export async function createSession(userId: string) {
  const { token, expiresAt } = await persistSession(db, userId);
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return findSession(db, token);
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

export async function requireWorkspace(workspaceId?: string, requiredRole: WorkspaceRole = "VIEWER") {
  const user = await requireUser();
  const selectedId = workspaceId ?? (await db.membership.findFirst({ where: { userId: user.id }, select: { workspaceId: true } }))?.workspaceId;
  if (!selectedId) redirect("/login");
  const membership = await authorizeWorkspace(db, user.id, selectedId, requiredRole);
  if (!membership) throw new Error("Forbidden");
  return { user, membership, workspace: membership.workspace };
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await revokeSession(db, token);
  store.delete(COOKIE);
}
