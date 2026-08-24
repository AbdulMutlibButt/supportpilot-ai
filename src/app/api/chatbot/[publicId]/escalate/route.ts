import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { escalateChat, getPublicChatbot } from "@/lib/ai/chatbot-service";
export async function POST(_:Request,{params}:{params:Promise<{publicId:string}>}){const {publicId}=await params,chatbot=await getPublicChatbot(db,publicId);if(!chatbot)return NextResponse.json({error:"Not found"},{status:404});const token=(await cookies()).get(`sp_chat_${publicId.slice(0,8)}`)?.value;if(!token)return NextResponse.json({error:"Start a chat first"},{status:400});await escalateChat(db,chatbot.id,token);return NextResponse.json({ok:true})}
