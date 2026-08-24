import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { OllamaProvider } from "../src/lib/ai/ollama-provider";
import { indexDocument } from "../src/lib/ai/indexing-service";
import { groundedAnswer } from "../src/lib/ai/rag-service";

const db = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL!})});
async function main(){try {
  const owner=await db.user.findUniqueOrThrow({where:{email:"owner@supportpilot.local"},include:{memberships:true}});
  const workspaceId=owner.memberships[0]?.workspaceId;
  if(!workspaceId)throw new Error("Seed workspace membership was not found");
  const document=await db.knowledgeDocument.findFirstOrThrow({where:{workspaceId,title:"Returns and account access"}});
  const provider=new OllamaProvider({
    baseUrl:process.env.OLLAMA_BASE_URL??"http://127.0.0.1:11434",
    chatModel:process.env.OLLAMA_CHAT_MODEL??"llama3.2:3b",
    embeddingModel:process.env.OLLAMA_EMBEDDING_MODEL??"nomic-embed-text",
    embeddingDimensions:Number(process.env.OLLAMA_EMBEDDING_DIMENSIONS??768),
    timeoutMs:90_000,
  });
  const health=await provider.health();
  if(!health.ok)throw new Error("Ollama health check failed");
  const indexing=await indexDocument(db,provider,owner.id,workspaceId,document.id,true);
  if(indexing.failed)throw new Error("Seed document indexing failed");
  const answer=await groundedAnswer(db,provider,workspaceId,"How long can customers return unused products?",{threshold:0.1});
  if(answer.refused||!answer.citations.length)throw new Error("Grounded seed answer or citation validation failed");
  console.log(JSON.stringify({provider:provider.name,health:true,indexed:indexing.indexed,citations:answer.citations.length,grounded:true}));
} finally {
  await db.$disconnect();
}}
main().catch(error=>{console.error(error instanceof Error?error.message:"AI smoke test failed");process.exitCode=1});
