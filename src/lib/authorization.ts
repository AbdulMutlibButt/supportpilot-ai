import type { PrismaClient } from "@prisma/client";
export type WorkspaceRole="OWNER"|"AGENT"|"VIEWER"; const rank:Record<WorkspaceRole,number>={VIEWER:1,AGENT:2,OWNER:3};
export function can(role:WorkspaceRole,required:WorkspaceRole){return rank[role]>=rank[required]}
export function belongsToWorkspace(memberships:{workspaceId:string}[],workspaceId:string){return memberships.some(m=>m.workspaceId===workspaceId)}
export async function authorizeWorkspace(client: PrismaClient,userId:string,workspaceId:string,required:WorkspaceRole="VIEWER"){
  const membership=await client.membership.findUnique({where:{userId_workspaceId:{userId,workspaceId}},include:{workspace:true}});
  if(!membership||!can(membership.role,required)) return null;
  return membership;
}
