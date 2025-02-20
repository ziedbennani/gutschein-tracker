-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "extraPayment" DOUBLE PRECISION,
ADD COLUMN     "oldId" TEXT,
ADD COLUMN     "tip" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "CouponHistory" ADD COLUMN     "extraPayment" DOUBLE PRECISION,
ADD COLUMN     "oldId" TEXT,
ADD COLUMN     "tip" DOUBLE PRECISION;
