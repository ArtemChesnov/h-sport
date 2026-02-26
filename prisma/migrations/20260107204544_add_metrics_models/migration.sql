-- CreateTable
CREATE TABLE "ApiMetric" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductView" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartAction" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "userId" TEXT,
    "cartId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteAction" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversion" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "productId" INTEGER,
    "orderId" INTEGER,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiMetric_endpoint_method_idx" ON "ApiMetric"("endpoint", "method");

-- CreateIndex
CREATE INDEX "ApiMetric_createdAt_idx" ON "ApiMetric"("createdAt");

-- CreateIndex
CREATE INDEX "ApiMetric_statusCode_idx" ON "ApiMetric"("statusCode");

-- CreateIndex
CREATE INDEX "ProductView_productId_idx" ON "ProductView"("productId");

-- CreateIndex
CREATE INDEX "ProductView_userId_idx" ON "ProductView"("userId");

-- CreateIndex
CREATE INDEX "ProductView_createdAt_idx" ON "ProductView"("createdAt");

-- CreateIndex
CREATE INDEX "CartAction_productId_idx" ON "CartAction"("productId");

-- CreateIndex
CREATE INDEX "CartAction_userId_idx" ON "CartAction"("userId");

-- CreateIndex
CREATE INDEX "CartAction_action_idx" ON "CartAction"("action");

-- CreateIndex
CREATE INDEX "CartAction_createdAt_idx" ON "CartAction"("createdAt");

-- CreateIndex
CREATE INDEX "FavoriteAction_productId_idx" ON "FavoriteAction"("productId");

-- CreateIndex
CREATE INDEX "FavoriteAction_userId_idx" ON "FavoriteAction"("userId");

-- CreateIndex
CREATE INDEX "FavoriteAction_action_idx" ON "FavoriteAction"("action");

-- CreateIndex
CREATE INDEX "FavoriteAction_createdAt_idx" ON "FavoriteAction"("createdAt");

-- CreateIndex
CREATE INDEX "Conversion_type_idx" ON "Conversion"("type");

-- CreateIndex
CREATE INDEX "Conversion_productId_idx" ON "Conversion"("productId");

-- CreateIndex
CREATE INDEX "Conversion_orderId_idx" ON "Conversion"("orderId");

-- CreateIndex
CREATE INDEX "Conversion_userId_idx" ON "Conversion"("userId");

-- CreateIndex
CREATE INDEX "Conversion_createdAt_idx" ON "Conversion"("createdAt");

-- AddForeignKey
ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartAction" ADD CONSTRAINT "CartAction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartAction" ADD CONSTRAINT "CartAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteAction" ADD CONSTRAINT "FavoriteAction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteAction" ADD CONSTRAINT "FavoriteAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversion" ADD CONSTRAINT "Conversion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversion" ADD CONSTRAINT "Conversion_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversion" ADD CONSTRAINT "Conversion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
