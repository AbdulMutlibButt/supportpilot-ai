import { createHash } from "crypto";
import type { AIProvider, ChatRequest, ChatResult, EmbeddingResult, ProviderHealth } from "./types";

function vector(text:string,dimensions:number){const result=Array(dimensions).fill(0);for(const token of text.toLowerCase().match(/[a-z0-9]+/g)??[]){const hash=createHash("sha256").update(token).digest();const index=hash.readUInt32BE(0)%dimensions;result[index]+=1}const length=Math.sqrt(result.reduce((sum,n)=>sum+n*n,0))||1;return result.map(n=>n/length)}
export class MockAIProvider implements AIProvider {
  readonly name="mock";readonly chatModel="mock-chat";readonly embeddingModel="mock-embed";readonly embeddingDimensions:number;
  constructor(public options:{unavailable?:boolean;delayMs?:number;dimensions?:number}={}){this.embeddingDimensions=options.dimensions??768}
  private async wait(signal?:AbortSignal){if(this.options.unavailable)throw new Error("Provider unavailable");if(signal?.aborted)throw new Error("Aborted");if(this.options.delayMs)await new Promise((resolve,reject)=>{const timer=setTimeout(resolve,this.options.delayMs);signal?.addEventListener("abort",()=>{clearTimeout(timer);reject(new Error("Aborted"))},{once:true})})}
  async chat(input:ChatRequest):Promise<ChatResult>{await this.wait(input.signal);const evidence=input.messages.at(-1)?.content.match(/EVIDENCE_START\n([\s\S]*?)\nEVIDENCE_END/)?.[1]??"";const ids=[...evidence.matchAll(/\[chunk:([^\]]+)\]/g)].map(x=>x[1]);return{text:ids.length?JSON.stringify({answer:"Based on the knowledge base, "+evidence.replace(/\[chunk:[^\]]+\]/g,"").trim().slice(0,180),citations:[ids[0]],refused:false}):JSON.stringify({answer:"I don’t have enough verified information to answer that. Please contact a human support agent.",citations:[],refused:true}),model:this.chatModel}}
  async *stream(input:ChatRequest){const result=await this.chat(input);for(const word of result.text.split(/(\s+)/))yield word}
  async embed(inputs:string[],signal?:AbortSignal):Promise<EmbeddingResult>{await this.wait(signal);return{vectors:inputs.map(x=>vector(x,this.embeddingDimensions)),model:this.embeddingModel,dimensions:this.embeddingDimensions}}
  async health():Promise<ProviderHealth>{return{ok:!this.options.unavailable,provider:this.name,version:"test"}}
}
