-- Rename inventory movements to stock movements (Task 56)

ALTER TYPE "InventoryMovementType" RENAME TO "StockMovementType";
ALTER TYPE "StockMovementType" RENAME VALUE 'ENTRY' TO 'IN';
ALTER TYPE "StockMovementType" RENAME VALUE 'EXIT' TO 'OUT';

ALTER TABLE "inventory_movements" RENAME TO "stock_movements";
ALTER TABLE "stock_movements" ALTER COLUMN "reason" DROP NOT NULL;

ALTER TYPE "AuditAction" ADD VALUE 'CREATE_STOCK_MOVEMENT';
