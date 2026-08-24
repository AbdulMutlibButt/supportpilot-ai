export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
export type ChatRequest = { messages: ChatMessage[]; signal?: AbortSignal; maxTokens?: number; temperature?: number };
export type ChatResult = { text: string; model: string; durationMs?: number };
export type EmbeddingResult = { vectors: number[][]; model: string; dimensions: number };
export type ProviderHealth = { ok: boolean; provider: string; version?: string; error?: string };

export class AIProviderError extends Error {
  constructor(message: string, public code: "UNAVAILABLE" | "TIMEOUT" | "INVALID_RESPONSE" | "CONFIGURATION", public retryable = false) { super(message); }
}

export interface AIProvider {
  readonly name: string;
  readonly chatModel: string;
  readonly embeddingModel: string;
  readonly embeddingDimensions: number;
  chat(input: ChatRequest): Promise<ChatResult>;
  stream(input: ChatRequest): AsyncIterable<string>;
  embed(inputs: string[], signal?: AbortSignal): Promise<EmbeddingResult>;
  health(signal?: AbortSignal): Promise<ProviderHealth>;
}
