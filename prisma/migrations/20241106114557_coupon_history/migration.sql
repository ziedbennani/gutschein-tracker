-- CreateTable
CREATE TABLE "CouponHistory" (
    "id" TEXT NOT NULL,
    "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employee" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "oldSystem" BOOLEAN NOT NULL,
    "firstValue" DECIMAL(65,30),
    "usedValue" DECIMAL(65,30),
    "restValue" DECIMAL(65,30) NOT NULL,
    "used" BOOLEAN NOT NULL,
    "couponId" TEXT NOT NULL,

    CONSTRAINT "CouponHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CouponHistory_couponId_modifiedAt_idx" ON "CouponHistory"("couponId", "modifiedAt");

-- AddForeignKey
ALTER TABLE "CouponHistory" ADD CONSTRAINT "CouponHistory_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
