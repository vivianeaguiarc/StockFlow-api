-- CreateIndex
CREATE INDEX "users_company_id_deleted_at_idx" ON "users"("company_id", "deleted_at");
