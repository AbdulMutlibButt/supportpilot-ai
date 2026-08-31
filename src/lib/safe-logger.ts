import "server-only";
type SafeLog={event:string;correlationId?:string;durationMs?:number;status?:string;workspaceIdHash?:string};
export function logSafe(entry:SafeLog){console.info(JSON.stringify({timestamp:new Date().toISOString(),...entry}))}
