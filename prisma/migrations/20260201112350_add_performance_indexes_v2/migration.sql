-- CreateIndex
CREATE INDEX "CartItem_productItemId_idx" ON "CartItem"("productItemId");

-- CreateIndex
CREATE INDEX "Order_cartToken_idx" ON "Order"("cartToken");

-- CreateIndex
CREATE INDEX "PasswordResetToken_identifier_idx" ON "PasswordResetToken"("identifier");
