import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";

// This handles PUT requests to /api/coupons/[id]/redeem
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;

  try {
    // Get the request body
    const data = await request.json();

    // Validate the parsed data
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 }
      );
    }

    const { usedValue, employee, location, tip, newId } = data;

    // Validate required fields
    if (!usedValue || !employee || !location) {
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

    // Calculate the new values
    const newRestValue = currentCoupon.restValue - usedValue;
    const newUsedValue = (currentCoupon.usedValue || 0) + usedValue;
    const isNowUsed = newRestValue <= 0;

    // Begin a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      console.log("begin transaction");
      // Create history record first (stores the previous state)
      const historyRecord = await tx.couponHistory.create({
        data: {
          couponId: id,
          employee: employee,
          description: newId
            ? `GUTSCHEIN WECHSEL: ${id} -> ${newId} | ${usedValue} € eingelöst`
            : `${usedValue} € eingelöst`,
          oldSystem: currentCoupon.oldSystem,
          oldId: newId ? id : null,
          firstValue: currentCoupon.restValue,
          usedValue: usedValue,
          restValue: newRestValue > 0 ? newRestValue : 0,
          used: isNowUsed,
          location: location,
          tip: tip,
          extraPayment: newRestValue < 0 ? Math.abs(newRestValue) : null,
        },
      });
      console.log("currentCoupon : ", currentCoupon);
      console.log("historyRecord : ", historyRecord);

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
            location: location,
            used: isNowUsed,
            updatedAt: new Date(),
            oldId: id,
            tip: tip,
            extraPayment: newRestValue < 0 ? Math.abs(newRestValue) : null,
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
            description: `${usedValue} € eingelöst von ${employee}`,
            employee: employee,
            location: location,
            used: isNowUsed,
            updatedAt: new Date(),
            tip: tip,
            extraPayment: newRestValue < 0 ? Math.abs(newRestValue) : null,
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
