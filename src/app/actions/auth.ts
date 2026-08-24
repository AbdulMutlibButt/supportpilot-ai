"use server";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { authenticate, createAccount } from "@/lib/auth-service";
import { loginSchema, registerSchema } from "@/lib/validation";
import { redirect } from "next/navigation";

export type AuthState = { message?: string; errors?: Record<string, string[]> };

export async function register(_: AuthState, form: FormData): Promise<AuthState> {
  const validated = registerSchema.safeParse(Object.fromEntries(form));
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };
  const result = await createAccount(db, validated.data);
  if (!result.ok) return { message: "An account with this email already exists." };
  await createSession(result.user.id);
  redirect("/dashboard");
}

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const validated = loginSchema.safeParse(Object.fromEntries(form));
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };
  const user = await authenticate(db, validated.data.email, validated.data.password);
  if (!user) return { message: "Email or password is incorrect." };
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() { await destroySession(); redirect("/login"); }
