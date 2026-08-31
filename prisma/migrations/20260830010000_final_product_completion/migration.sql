CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'BUSINESS');
CREATE TYPE "EmailType" AS ENUM ('INVITATION', 'PASSWORD_RESET', 'ASSIGNMENT', 'HUMAN_ESCALATION');
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED');

ALTER TABLE "Workspace" ADD COLUMN "plan" "Plan" NOT NULL DEFAULT 'FREE';

CREATE TABLE "SubscriptionEvent" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "actorId" TEXT,
  "fromPlan" "Plan" NOT NULL,
  "toPlan" "Plan" NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubscriptionEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DevelopmentEmail" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT,
  "recipientUserId" TEXT,
  "toAddress" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "previewBody" TEXT NOT NULL,
  "actionUrl" TEXT,
  "type" "EmailType" NOT NULL,
  "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "failureReason" TEXT,
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DevelopmentEmail_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "SubscriptionEvent_workspaceId_createdAt_idx" ON "SubscriptionEvent"("workspaceId", "createdAt" DESC);
CREATE INDEX "DevelopmentEmail_workspaceId_createdAt_idx" ON "DevelopmentEmail"("workspaceId", "createdAt" DESC);
CREATE INDEX "DevelopmentEmail_recipientUserId_createdAt_idx" ON "DevelopmentEmail"("recipientUserId", "createdAt" DESC);
CREATE INDEX "DevelopmentEmail_status_createdAt_idx" ON "DevelopmentEmail"("status", "createdAt");
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

ALTER TABLE "SubscriptionEvent" ADD CONSTRAINT "SubscriptionEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DevelopmentEmail" ADD CONSTRAINT "DevelopmentEmail_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DevelopmentEmail" ADD CONSTRAINT "DevelopmentEmail_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
