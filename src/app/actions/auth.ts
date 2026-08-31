"use server";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { authenticate, createAccount } from "@/lib/auth-service";
import { loginSchema, registerSchema } from "@/lib/validation";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requestPasswordReset, resetPassword } from "@/lib/password-reset-service";
import { checkRateLimit, hashValue } from "@/lib/ai/safety";

export type AuthState = { message?: string; errors?: Record<string, string[]> };

export async function register(_: AuthState, form: FormData): Promise<AuthState> {
  const validated = registerSchema.safeParse(Object.fromEntries(form));
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };
  try {
    checkRateLimit(`register:${hashValue(validated.data.email.toLowerCase())}`, 5, 60 * 60_000);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Please wait before trying again." };
  }
  const result = await createAccount(db, validated.data);
  if (!result.ok) return { message: "An account with this email already exists." };
  await createSession(result.user.id);
  redirect("/dashboard");
}

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const validated = loginSchema.safeParse(Object.fromEntries(form));
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };
  try {
    checkRateLimit(`login:${hashValue(validated.data.email.toLowerCase())}`, 10, 60_000);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Please wait before trying again." };
  }
  const user = await authenticate(db, validated.data.email, validated.data.password);
  if (!user) return { message: "Email or password is incorrect." };
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() { await destroySession(); redirect("/login"); }

export async function requestReset(_:AuthState,form:FormData):Promise<AuthState>{const parsed=z.email().safeParse(form.get("email"));if(parsed.success){try{checkRateLimit(`password-reset:${hashValue(parsed.data.toLowerCase())}`,5,15*60_000);await requestPasswordReset(db,parsed.data)}catch{return{message:"If an account matches that email, a short-lived reset link is now available in the authorized development outbox."}}}return{message:"If an account matches that email, a short-lived reset link is now available in the authorized development outbox."}}
export async function completeReset(_:AuthState,form:FormData):Promise<AuthState>{const parsed=z.object({token:z.string().min(20),password:registerSchema.shape.password,confirmPassword:z.string()}).refine(x=>x.password===x.confirmPassword,{path:["confirmPassword"],message:"Passwords must match."}).safeParse(Object.fromEntries(form));if(!parsed.success)return{errors:parsed.error.flatten().fieldErrors};try{await resetPassword(db,parsed.data.token,parsed.data.password)}catch{return{message:"This password-reset link is invalid, expired, or already used."}}redirect("/login?reset=1")}
