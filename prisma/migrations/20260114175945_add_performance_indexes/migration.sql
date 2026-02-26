-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_productId_idx" ON "OrderItem"("orderId", "productId");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "ProductItem_productId_isAvailable_idx" ON "ProductItem"("productId", "isAvailable");

-- CreateIndex
CREATE INDEX "ProductItem_productId_isAvailable_price_idx" ON "ProductItem"("productId", "isAvailable", "price");
