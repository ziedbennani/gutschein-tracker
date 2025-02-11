import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { usedValue, employee, location } = await request.json();
    const couponId = context.params.id;

    // Get the current coupon
    const currentCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!currentCoupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Calculate new values
    const newUsedValue = (currentCoupon.usedValue || 0) + Number(usedValue);
    const newRestValue = (currentCoupon.firstValue || 0) - newUsedValue;

    // Check if there's enough value left
    if (newRestValue < 0) {
      return NextResponse.json(
        { error: "Insufficient coupon value" },
        { status: 400 }
      );
    }

    // Update the coupon with employee and location
    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        usedValue: newUsedValue,
        restValue: newRestValue,
        used: newRestValue === 0,
        updatedAt: new Date(),
        employee: employee,
        location: location,
      },
    });

    console.log("Updated coupon:", updatedCoupon);
    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error("Error redeeming coupon:", error);
    return NextResponse.json(
      { error: "Failed to redeem coupon" },
      { status: 500 }
    );
  }
}
