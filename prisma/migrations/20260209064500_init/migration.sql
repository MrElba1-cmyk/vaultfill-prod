-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE IF NOT EXISTS "DocumentSection" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "metadata" JSONB,
    "source" TEXT NOT NULL,

    CONSTRAINT "DocumentSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "leads" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_agent" TEXT,
    "monthly_volume" TEXT,
    "current_process" TEXT,
    "primary_formats" TEXT,
    "role" TEXT,
    "tier" TEXT,
    "source" TEXT DEFAULT 'web',

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DocumentSection_source_idx" ON "DocumentSection"("source");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "leads_email_key" ON "leads"("email");
