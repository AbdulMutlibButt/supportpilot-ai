-- CreateEnum
CREATE TYPE "EmbeddingStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "AIFeedbackValue" AS ENUM ('HELPFUL', 'NOT_HELPFUL');

-- AlterEnum
ALTER TYPE "MessageAuthorType" ADD VALUE 'AI';

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "aiSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "humanTakeoverAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ChunkEmbedding" (
    "id" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "vector" JSONB,
    "model" TEXT NOT NULL,
    "dimensions" INTEGER NOT NULL,
    "contentHash" TEXT NOT NULL,
    "status" "EmbeddingStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "indexedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChunkEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotConfig" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Support assistant',
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Hi! How can we help?',
    "color" TEXT NOT NULL DEFAULT '#6558f5',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerChatSession" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "escalatedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIResponse" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "conversationId" TEXT,
    "messageId" TEXT,
    "questionHash" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "refused" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT NOT NULL,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AICitation" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "excerpt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AICitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIFeedback" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" "AIFeedbackValue" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsageEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChunkEmbedding_chunkId_key" ON "ChunkEmbedding"("chunkId");

-- CreateIndex
CREATE INDEX "ChunkEmbedding_status_updatedAt_idx" ON "ChunkEmbedding"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "ChunkEmbedding_model_dimensions_idx" ON "ChunkEmbedding"("model", "dimensions");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotConfig_workspaceId_key" ON "ChatbotConfig"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotConfig_publicId_key" ON "ChatbotConfig"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerChatSession_conversationId_key" ON "CustomerChatSession"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerChatSession_tokenHash_key" ON "CustomerChatSession"("tokenHash");

-- CreateIndex
CREATE INDEX "CustomerChatSession_workspaceId_lastSeenAt_idx" ON "CustomerChatSession"("workspaceId", "lastSeenAt");

-- CreateIndex
CREATE INDEX "CustomerChatSession_chatbotId_createdAt_idx" ON "CustomerChatSession"("chatbotId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AIResponse_messageId_key" ON "AIResponse"("messageId");

-- CreateIndex
CREATE INDEX "AIResponse_workspaceId_createdAt_idx" ON "AIResponse"("workspaceId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AIResponse_conversationId_createdAt_idx" ON "AIResponse"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "AICitation_chunkId_idx" ON "AICitation"("chunkId");

-- CreateIndex
CREATE UNIQUE INDEX "AICitation_responseId_chunkId_key" ON "AICitation"("responseId", "chunkId");

-- CreateIndex
CREATE UNIQUE INDEX "AIFeedback_responseId_userId_key" ON "AIFeedback"("responseId", "userId");

-- CreateIndex
CREATE INDEX "AIUsageEvent_workspaceId_createdAt_idx" ON "AIUsageEvent"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "ChunkEmbedding" ADD CONSTRAINT "ChunkEmbedding_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "DocumentChunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotConfig" ADD CONSTRAINT "ChatbotConfig_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerChatSession" ADD CONSTRAINT "CustomerChatSession_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerChatSession" ADD CONSTRAINT "CustomerChatSession_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "ChatbotConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerChatSession" ADD CONSTRAINT "CustomerChatSession_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIResponse" ADD CONSTRAINT "AIResponse_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIResponse" ADD CONSTRAINT "AIResponse_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIResponse" ADD CONSTRAINT "AIResponse_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AICitation" ADD CONSTRAINT "AICitation_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "AIResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AICitation" ADD CONSTRAINT "AICitation_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "DocumentChunk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIFeedback" ADD CONSTRAINT "AIFeedback_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "AIResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIFeedback" ADD CONSTRAINT "AIFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsageEvent" ADD CONSTRAINT "AIUsageEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
