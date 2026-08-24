import { NextResponse } from "next/server";
import { z } from "zod";
import { requireWorkspace } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import { groundedAnswer } from "@/lib/ai/rag-service";
import { getConversation } from "@/lib/support-service";
export async function POST(request:Request){try{const {user,workspace}=await requireWorkspace(undefined,"AGENT"),{conversationId}=z.object({conversationId:z.string()}).parse(await request.json()),conversation=await getConversation(db,user.id,workspace.id,conversationId);if(!conversation)throw new Error("Conversation not found");if(conversation.aiSuspended)throw new Error("AI is suspended after human takeover");const question=[...conversation.messages].reverse().find(x=>x.authorType==="CUSTOMER")?.body;if(!question)throw new Error("No customer question found");return NextResponse.json(await groundedAnswer(db,getAIProvider(),workspace.id,question,{conversationId}))}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Suggestion unavailable"},{status:400})}}
