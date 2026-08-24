import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { PublicChatbot } from "@/components/public-chatbot";
import { db } from "@/lib/db";
import { getPublicChatbot, publicConversation } from "@/lib/ai/chatbot-service";

export default async function ChatPage({params}:{params:Promise<{publicId:string}>}){const {publicId}=await params,chatbot=await getPublicChatbot(db,publicId);if(!chatbot)notFound();const token=(await cookies()).get(`sp_chat_${publicId.slice(0,8)}`)?.value,session=await publicConversation(db,chatbot.id,token);const responses=new Map(session?.conversation.aiResponses.map(r=>[r.messageId,r])??[]);const initial=session?.conversation.messages.map(message=>{const response=responses.get(message.id);return{role:(message.authorType==="CUSTOMER"?"customer":message.authorType==="AI"?"ai":"human") as "customer"|"ai"|"human",body:message.body,citations:response?.citations.map(c=>({title:c.chunk.document.title,pageNumber:c.chunk.pageNumber,section:c.chunk.section,excerpt:c.excerpt}))}})??[];return <PublicChatbot publicId={publicId} name={chatbot.name} welcome={chatbot.welcomeMessage} color={chatbot.color} initial={initial}/>}
