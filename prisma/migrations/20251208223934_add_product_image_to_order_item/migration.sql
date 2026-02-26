/*
  Warnings:

  - The values [SELF_PICKUP] on the enum `DeliveryMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeliveryMethod_new" AS ENUM ('CDEK_PVZ', 'CDEK_COURIER', 'POCHTA_PVZ', 'POCHTA_COURIER', 'PICKUP_SHOWROOM');
ALTER TABLE "Delivery" ALTER COLUMN "method" TYPE "DeliveryMethod_new" USING ("method"::text::"DeliveryMethod_new");
ALTER TYPE "DeliveryMethod" RENAME TO "DeliveryMethod_old";
ALTER TYPE "DeliveryMethod_new" RENAME TO "DeliveryMethod";
DROP TYPE "public"."DeliveryMethod_old";
COMMIT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productImageUrl" TEXT;
