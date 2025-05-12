import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/db";

// This handles PUT requests to /api/coupons/[id]/redeem
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const id = (await context.params).id;
  // Get the request body
  const data = await request.json();
  try {
    // Validate the parsed data
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 }
      );
    }

    const { usedValue, employee, location, tip, newId } = data;

    // Validate required fields - for Klein Becher coupons, usedValue can be 0
    if (usedValue === undefined || !employee || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch the current coupon data
    const currentCoupon = await prisma.coupon.findUnique({
      where: { id },
    });
    console.log("currentCoupon : ", currentCoupon);
    if (!currentCoupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Check if this is a Klein Becher coupon
    const isKleinBecher = currentCoupon.couponType === "klein";

    // For Klein Becher coupons, we don't need to calculate values
    // Just mark it as used
    if (isKleinBecher) {
      // Begin a transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        console.log("begin transaction for Klein Becher");

        // Create history record
        const historyRecord = await tx.couponHistory.create({
          data: {
            couponId: id,
            employee: employee,
            description: `kl.Becher(${new Date(
              currentCoupon.createdAt
            ).getFullYear()}) eingelöst`,
            oldSystem: currentCoupon.oldSystem,
            oldId: null,
            firstValue: currentCoupon.firstValue,
            usedValue: usedValue,
            restValue: currentCoupon.restValue,
            used: true,
            location: location,
            couponType: currentCoupon.couponType,
          },
        });

        // Update Coupon
        const updatedCoupon = await tx.coupon.update({
          where: { id },
          data: {
            description: `kl.Becher(${new Date(
              currentCoupon.createdAt
            ).getFullYear()}) eingelöst`,
            firstValue: currentCoupon.firstValue,
            usedValue: usedValue,
            restValue: currentCoupon.restValue,
            employee: employee,
            location: location,
            used: true,
            updatedAt: new Date(),
          },
        });

        return {
          historyRecord,
          updatedCoupon,
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          couponId: result.updatedCoupon.id,
          historyId: result.historyRecord.id,
        },
      });
    }

    // For regular value coupons, proceed with the existing logic
    // Calculate the new values
    const currentRestValue = currentCoupon.restValue
      ? Number(currentCoupon.restValue)
      : 0;
    const newRestValue = tip
      ? currentRestValue - usedValue - tip
      : currentRestValue - usedValue;
    console.log("newRestValue : ", newRestValue);
    const newUsedValue =
      (currentCoupon.usedValue ? Number(currentCoupon.usedValue) : 0) +
      usedValue;
    console.log("newUsedValue : ", newUsedValue);
    const isNowUsed = newRestValue < 0.01; // Consider values less than 0.01 as effectively zero
    console.log("isNowUsed : ", isNowUsed);

    // Begin a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      console.log("begin transaction");
      // Create history record first (stores the previous state)
      const historyRecord = await tx.couponHistory.create({
        data: {
          couponId: id,
          employee: employee,
          description: newId
            ? `WECHSEL! ${id} -> ${newId} und ${Number(usedValue).toFixed(
                2
              )} € eingelöst`
            : `${Number(usedValue).toFixed(2)} € eingelöst`,
          oldSystem: currentCoupon.oldSystem,
          oldId: newId ? id : null,
          firstValue: currentCoupon.restValue,
          usedValue: usedValue,
          restValue: newRestValue > 0 ? newRestValue : 0,
          used: isNowUsed,
          location: location,
          tip: tip,
          extraPayment: newRestValue < 0 ? Math.abs(newRestValue) : null,
          couponType: currentCoupon.couponType,
        },
      });

      // If newId is provided, update the coupon ID
      if (newId) {
        console.log("newId : ", newId);
        // First, check if the new ID already exists to avoid conflicts
        const existingCoupon = await tx.coupon.findUnique({
          where: { id: newId },
        });

        if (existingCoupon) {
          throw new Error("The new coupon ID already exists");
        }

        // Update coupon with new ID and other values
        const updatedCoupon = await tx.coupon.update({
          where: { id },
          data: {
            id: newId,
            restValue: newRestValue > 0 ? newRestValue : 0,
            usedValue: newUsedValue,
            employee: employee,
            description: `WECHSEL! ${id} -> ${newId} und ${Number(
              usedValue
            ).toFixed(2)} € eingelöst`,
            location: location,
            used: isNowUsed,
            updatedAt: new Date(),
            oldId: id,
            tip: tip,
            extraPayment: newRestValue < 0 ? Math.abs(newRestValue) : null,
            couponType: currentCoupon.couponType,
          },
        });

        return {
          historyRecord,
          updatedCoupon,
        };
      } else {
        // Regular update without changing ID
        console.log("else");
        const updatedCoupon = await tx.coupon.update({
          where: { id },
          data: {
            restValue: newRestValue > 0 ? newRestValue : 0,
            usedValue: newUsedValue,
            description: `${Number(usedValue).toFixed(2)} € eingelöst`,
            employee: employee,
            location: location,
            used: isNowUsed,
            updatedAt: new Date(),
            tip: tip,
            extraPayment: newRestValue < 0 ? Math.abs(newRestValue) : null,
            couponType: currentCoupon.couponType,
          },
        });
        console.log("updatedCoupon else : ", updatedCoupon);

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
