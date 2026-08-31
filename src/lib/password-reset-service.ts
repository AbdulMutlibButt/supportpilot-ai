import "server-only";
import {createHash,randomBytes} from "crypto";
import {hash} from "bcryptjs";
import type {PrismaClient} from "@prisma/client";
import {DevelopmentOutboxProvider} from "./email-provider";

const digest=(token:string)=>createHash("sha256").update(token).digest("hex");
export const RESET_TTL_MS=30*60*1000;
export async function requestPasswordReset(db:PrismaClient,email:string,baseUrl="http://localhost:3000"){const user=await db.user.findUnique({where:{email:email.toLowerCase()}});if(!user)return;const token=randomBytes(32).toString("base64url"),expiresAt=new Date(Date.now()+RESET_TTL_MS);await db.passwordResetToken.deleteMany({where:{userId:user.id,usedAt:null}});await db.passwordResetToken.create({data:{userId:user.id,tokenHash:digest(token),expiresAt}});const workspaceId=(await db.membership.findFirst({where:{userId:user.id},select:{workspaceId:true}}))?.workspaceId;const provider=new DevelopmentOutboxProvider(db),queued=await provider.queue({workspaceId,recipientUserId:user.id,to:user.email,type:"PASSWORD_RESET",subject:"Reset your SupportPilot password",body:"A local-development password reset was requested. This link expires in 30 minutes and can be used once.",actionUrl:`${baseUrl}/reset-password/${token}`});await provider.deliver(queued.id)}
export async function resetPassword(db:PrismaClient,token:string,password:string){const row=await db.passwordResetToken.findUnique({where:{tokenHash:digest(token)}});if(!row||row.usedAt||row.expiresAt<=new Date())throw new Error("This password-reset link is invalid or has expired");const passwordHash=await hash(password,12);await db.$transaction([db.user.update({where:{id:row.userId},data:{passwordHash}}),db.passwordResetToken.update({where:{id:row.id},data:{usedAt:new Date()}}),db.session.deleteMany({where:{userId:row.userId}})])}
