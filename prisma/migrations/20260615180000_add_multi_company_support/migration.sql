-- Replace CompanyStatus enum with active boolean and add company audit actions.

ALTER TABLE "companies" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

UPDATE "companies" SET "active" = ("status" = 'ACTIVE');

ALTER TABLE "companies" ALTER COLUMN "document" DROP NOT NULL;

ALTER TABLE "companies" DROP COLUMN "status";

DROP TYPE "CompanyStatus";

ALTER TYPE "AuditAction" ADD VALUE 'CREATE_COMPANY';
ALTER TYPE "AuditAction" ADD VALUE 'UPDATE_COMPANY';
ALTER TYPE "AuditAction" ADD VALUE 'DELETE_COMPANY';
