/*
  Warnings:

  - You are about to alter the column `firstValue` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `usedValue` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `restValue` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `extraPayment` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `tip` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `firstValue` on the `CouponHistory` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `usedValue` on the `CouponHistory` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `restValue` on the `CouponHistory` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `extraPayment` on the `CouponHistory` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `tip` on the `CouponHistory` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "firstValue" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "usedValue" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "restValue" DROP NOT NULL,
ALTER COLUMN "restValue" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "extraPayment" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "tip" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "CouponHistory" ALTER COLUMN "firstValue" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "usedValue" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "restValue" DROP NOT NULL,
ALTER COLUMN "restValue" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "extraPayment" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "tip" SET DATA TYPE DECIMAL(10,2);
