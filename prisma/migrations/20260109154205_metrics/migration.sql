/*
  Warnings:

  - You are about to alter the column `name` on the `Category` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `slug` on the `Category` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `name` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `slug` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `sku` on the `ProductItem` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `color` on the `ProductItem` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `code` on the `PromoCode` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `passwordHash` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `secondName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `phone` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "ProductItem" ALTER COLUMN "sku" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "color" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "PromoCode" ALTER COLUMN "code" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "value" SET DEFAULT 0,
ALTER COLUMN "minOrder" SET DEFAULT 0,
ALTER COLUMN "usageLimit" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "passwordHash" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "secondName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20);
