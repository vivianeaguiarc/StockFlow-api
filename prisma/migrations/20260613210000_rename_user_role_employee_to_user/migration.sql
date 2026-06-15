-- Rename UserRole enum value EMPLOYEE -> USER
ALTER TYPE "UserRole" RENAME VALUE 'EMPLOYEE' TO 'USER';

-- Update default for new users
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
