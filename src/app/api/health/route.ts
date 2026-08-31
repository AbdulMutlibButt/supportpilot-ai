import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {systemHealth} from "@/lib/health-service";
import {logSafe} from "@/lib/safe-logger";
export async function GET(request:Request){const health=await systemHealth(db),correlationId=request.headers.get("x-correlation-id")??undefined;logSafe({event:"health.check",correlationId,durationMs:health.durationMs,status:health.ok?"ok":"degraded"});return NextResponse.json(health,{status:health.ok?200:503,headers:{"cache-control":"no-store"}})}
