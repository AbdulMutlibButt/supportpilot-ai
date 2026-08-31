"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {z} from "zod";
import {db} from "@/lib/db";
import {requireWorkspace} from "@/lib/auth";
import {changePlan} from "@/lib/plan-service";
import {retryDevelopmentEmail} from "@/lib/email-provider";
export async function changePlanAction(form:FormData){const {user,workspace}=await requireWorkspace(undefined,"OWNER");const plan=z.enum(["FREE","PRO","BUSINESS"]).parse(form.get("plan"));if(form.get("confirmation")!=="DEMO_ONLY")throw new Error("Confirm that this is a no-charge demonstration");await changePlan(db,user.id,workspace.id,plan);revalidatePath("/dashboard/billing");redirect("/dashboard/billing?changed=1")}
export async function retryEmailAction(form:FormData){const {user,workspace}=await requireWorkspace(undefined,"OWNER");const id=z.string().min(1).parse(form.get("emailId"));await retryDevelopmentEmail(db,user.id,workspace.id,id);revalidatePath("/dashboard/development-emails")}
