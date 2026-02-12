-- CreateTable
CREATE TABLE "AuditRecord" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "findings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditRecord_userId_idx" ON "AuditRecord"("userId");
