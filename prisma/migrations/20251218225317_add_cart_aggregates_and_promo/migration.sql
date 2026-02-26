-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "discount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "promoCodeId" INTEGER,
ADD COLUMN     "subtotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalItems" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Cart_promoCodeId_idx" ON "Cart"("promoCodeId");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
