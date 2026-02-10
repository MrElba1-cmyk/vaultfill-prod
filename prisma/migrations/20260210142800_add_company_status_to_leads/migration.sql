-- AlterTable
ALTER TABLE "leads" ADD COLUMN "company_name" TEXT;
ALTER TABLE "leads" ADD COLUMN "status" TEXT DEFAULT 'new';
