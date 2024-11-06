/*
  Warnings:

  - You are about to alter the column `firstValue` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `usedValue` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `restValue` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `firstValue` on the `CouponHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `usedValue` on the `CouponHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `restValue` on the `CouponHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "firstValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "usedValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "restValue" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "CouponHistory" ALTER COLUMN "firstValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "usedValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "restValue" SET DATA TYPE DOUBLE PRECISION;
