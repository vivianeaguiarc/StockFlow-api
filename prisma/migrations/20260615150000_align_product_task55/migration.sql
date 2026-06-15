-- Align Product model with Task 55: price, active, optional category/supplier

ALTER TABLE "products" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "products" ADD COLUMN "price" DECIMAL(10, 2);

UPDATE "products"
SET
  "price" = "sale_price",
  "active" = ("status" = 'ACTIVE');

ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL;

ALTER TABLE "products" ALTER COLUMN "category_id" DROP NOT NULL;
ALTER TABLE "products" ALTER COLUMN "supplier_id" DROP NOT NULL;

ALTER TABLE "products" DROP COLUMN "cost_price";
ALTER TABLE "products" DROP COLUMN "sale_price";
ALTER TABLE "products" DROP COLUMN "status";

DROP TYPE "ProductStatus";
