import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./../../../../../../lib/db";

// This handles PUT requests to /api/coupons/[id]/redeem
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const couponId = params.id;
    const data = await request.json();
    const { usedValue, employee, location, newId } = data;

    // Fetch the current coupon data
    const currentCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!currentCoupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Calculate the new values
    const newRestValue = currentCoupon.restValue - usedValue;
    const newUsedValue = (currentCoupon.usedValue || 0) + usedValue;
    const isNowUsed = newRestValue <= 0;

    // Begin a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create history record first (stores the previous state)
      // We store the original coupon ID and the target coupon ID (if changed)
      const historyRecord = await tx.couponHistory.create({
        data: {
          employee: currentCoupon.employee,
          description: newId
            ? `ID changed from ${couponId} to ${newId}. Redeemed €${usedValue}`
            : `Redeemed €${usedValue} by ${employee}`,
          oldSystem: currentCoupon.oldSystem,
          firstValue: currentCoupon.firstValue,
          usedValue: currentCoupon.usedValue,
          restValue: currentCoupon.restValue,
          used: currentCoupon.used,
          couponId: couponId,
        },
      });

      // If newId is provided, update the coupon ID
      if (newId) {
        // First, check if the new ID already exists to avoid conflicts
        const existingCoupon = await tx.coupon.findUnique({
          where: { id: newId },
        });

        if (existingCoupon) {
          throw new Error("The new coupon ID already exists");
        }

        // Update coupon with new ID and other values
        const updatedCoupon = await tx.coupon.update({
          where: { id: couponId },
          data: {
            id: newId,
            restValue: Math.max(0, newRestValue),
            usedValue: newUsedValue,
            employee: employee,
            location: location,
            used: isNowUsed,
            updatedAt: new Date(),
          },
        });

        return {
          historyRecord,
          updatedCoupon,
        };
      } else {
        // Regular update without changing ID
        const updatedCoupon = await tx.coupon.update({
          where: { id: couponId },
          data: {
            restValue: Math.max(0, newRestValue),
            usedValue: newUsedValue,
            employee: employee,
            location: location,
            used: isNowUsed,
            updatedAt: new Date(),
          },
        });

        return {
          historyRecord,
          updatedCoupon,
        };
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        couponId: result.updatedCoupon.id,
        historyId: result.historyRecord.id,
      },
    });
  } catch (error) {
    console.error("Error processing coupon redemption:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to process coupon redemption";

    return NextResponse.json(
      { error: errorMessage },
      {
        status:
          error instanceof Error &&
          error.message === "The new coupon ID already exists"
            ? 409
            : 500,
      }
    );
  }
}
