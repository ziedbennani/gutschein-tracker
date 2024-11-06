/*
  Warnings:

  - You are about to drop the `Gutschein` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Gutschein";

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employee" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "oldSystem" BOOLEAN NOT NULL,
    "firstValue" INTEGER,
    "usedValue" INTEGER,
    "restValue" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);
