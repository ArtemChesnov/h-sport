-- CreateIndex
CREATE INDEX "ProductItem_color_size_idx" ON "ProductItem"("color", "size");

-- CreateIndex
CREATE INDEX "ProductItem_isAvailable_idx" ON "ProductItem"("isAvailable");
