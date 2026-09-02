import "server-only";
import { OllamaProvider } from "./ollama-provider";
import { MockAIProvider } from "./mock-provider";
import type { AIProvider } from "./types";
import { validateRuntimeConfig } from "../runtime-config";

export function createAIProvider(env:NodeJS.ProcessEnv=process.env):AIProvider{const config=validateRuntimeConfig(env);if(config.provider==="mock"&&env.ALLOW_MOCK_AI==="true")return new MockAIProvider({dimensions:768});return new OllamaProvider({baseUrl:env.OLLAMA_BASE_URL??"http://127.0.0.1:11434",chatModel:env.OLLAMA_CHAT_MODEL??"llama3.2:3b",embeddingModel:env.OLLAMA_EMBEDDING_MODEL??"nomic-embed-text",embeddingDimensions:Number(env.OLLAMA_EMBEDDING_DIMENSIONS??768)})}
let singleton:AIProvider|undefined;
export const getAIProvider=()=>singleton??=createAIProvider();
