-- Add product-specific audit actions

ALTER TYPE "AuditAction" ADD VALUE 'CREATE_PRODUCT';
ALTER TYPE "AuditAction" ADD VALUE 'UPDATE_PRODUCT';
ALTER TYPE "AuditAction" ADD VALUE 'DELETE_PRODUCT';
