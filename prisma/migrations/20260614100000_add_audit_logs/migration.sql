-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'CREATE_USER';
ALTER TYPE "AuditAction" ADD VALUE 'UPDATE_USER';
ALTER TYPE "AuditAction" ADD VALUE 'DELETE_USER';

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN "metadata" JSONB;
ALTER TABLE "audit_logs" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "audit_logs" ALTER COLUMN "entity_id" DROP NOT NULL;
