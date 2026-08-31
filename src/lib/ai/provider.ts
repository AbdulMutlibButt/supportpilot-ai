import "server-only";
import { OllamaProvider } from "./ollama-provider";
import { MockAIProvider } from "./mock-provider";
import type { AIProvider } from "./types";
import { validateRuntimeConfig } from "../runtime-config";

export function createAIProvider(env:NodeJS.ProcessEnv=process.env):AIProvider{validateRuntimeConfig(env);const provider=env.AI_PROVIDER??"ollama";if(provider==="mock"&&env.ALLOW_MOCK_AI==="true")return new MockAIProvider({dimensions:Number(env.OLLAMA_EMBEDDING_DIMENSIONS??768)});if(provider!=="ollama")throw new Error(`Unsupported AI provider: ${provider}`);return new OllamaProvider({baseUrl:env.OLLAMA_BASE_URL??"http://127.0.0.1:11434",chatModel:env.OLLAMA_CHAT_MODEL??"llama3.2:3b",embeddingModel:env.OLLAMA_EMBEDDING_MODEL??"nomic-embed-text",embeddingDimensions:Number(env.OLLAMA_EMBEDDING_DIMENSIONS??768)})}
let singleton:AIProvider|undefined;
export const getAIProvider=()=>singleton??=createAIProvider();
