-- Marca empresas de demonstração para bloquear ações destrutivas nelas.

ALTER TABLE "companies" ADD COLUMN "is_demo" BOOLEAN NOT NULL DEFAULT false;

-- Empresas criadas pelo seed (prisma/seed-data.ts). Ao rodar
-- `prisma migrate deploy` no Render, a empresa demo já existente fica protegida.
UPDATE "companies" SET "is_demo" = true WHERE "document" IN ('12345678000190', '98765432000110');
