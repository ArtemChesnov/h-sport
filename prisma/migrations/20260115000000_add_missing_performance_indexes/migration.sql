-- CreateIndex
CREATE INDEX "ProductItem_color_isAvailable_idx" ON "ProductItem"("color", "isAvailable");

-- CreateIndex
CREATE INDEX "ProductItem_size_isAvailable_idx" ON "ProductItem"("size", "isAvailable");

-- CreateIndex
CREATE INDEX "ProductItem_color_size_isAvailable_idx" ON "ProductItem"("color", "size", "isAvailable");

-- CreateIndex
-- Примечание: В production может потребоваться выполнение в период низкой нагрузки,
-- так как создание индексов может заблокировать таблицы при большом объеме данных
CREATE INDEX "OrderItem_productId_orderId_idx" ON "OrderItem"("productId", "orderId");
