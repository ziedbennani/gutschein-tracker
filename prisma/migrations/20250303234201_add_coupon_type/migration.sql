-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "couponType" TEXT NOT NULL DEFAULT 'value';

-- AlterTable
ALTER TABLE "CouponHistory" ADD COLUMN     "couponType" TEXT NOT NULL DEFAULT 'value';
