"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireWorkspace } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import { indexDocument } from "@/lib/ai/indexing-service";

export async function indexDocumentAction(form:FormData){const {user,workspace}=await requireWorkspace(undefined,"AGENT");const documentId=z.string().min(1).parse(form.get("documentId")),force=form.get("force")==="true";await indexDocument(db,getAIProvider(),user.id,workspace.id,documentId,force);revalidatePath(`/dashboard/knowledge/${documentId}`)}
export async function saveChatbotAction(form:FormData){const {workspace}=await requireWorkspace(undefined,"OWNER");const data=z.object({name:z.string().trim().min(2).max(80),welcomeMessage:z.string().trim().min(2).max(300),color:z.string().regex(/^#[0-9a-fA-F]{6}$/)}).parse(Object.fromEntries(form));await db.chatbotConfig.upsert({where:{workspaceId:workspace.id},create:{workspaceId:workspace.id,...data},update:data});revalidatePath("/dashboard/settings")}
