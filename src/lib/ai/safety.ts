import { createHash, randomBytes } from "crypto";

export const MAX_QUESTION_LENGTH=2_000,MAX_ANSWER_LENGTH=6_000,MAX_RETRIEVAL_RESULTS=5,DAILY_WORKSPACE_LIMIT=500;
export const hashValue=(value:string)=>createHash("sha256").update(value).digest("hex");
export const newAnonymousToken=()=>randomBytes(32).toString("base64url");
export function cleanInput(value:string){const clean=value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").trim();if(!clean||clean.length>MAX_QUESTION_LENGTH)throw new Error(`Questions must be between 1 and ${MAX_QUESTION_LENGTH} characters`);return clean}
export function safeExcerpt(value:string,limit=240){return value.replace(/\s+/g," ").trim().slice(0,limit)}

const buckets=new Map<string,{count:number;reset:number}>();
export function checkRateLimit(key:string,limit=12,windowMs=60_000){const now=Date.now(),bucket=buckets.get(key);if(!bucket||bucket.reset<=now){buckets.set(key,{count:1,reset:now+windowMs});return}if(bucket.count>=limit)throw new Error("Too many requests. Please wait a moment and try again.");bucket.count++}
export function resetRateLimits(){buckets.clear()}
