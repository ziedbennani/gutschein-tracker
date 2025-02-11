import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: NextRequest, { params }: { params: any }) {
  const couponId = params.id;

  try {
    const { usedValue, employee, location } = await req.json();

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

    if (newRestValue < 0) {
      return NextResponse.json(
        { error: "Insufficient coupon value" },
        { status: 400 }
      );
    }

    // Update the coupon
    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        usedValue: newUsedValue,
        restValue: newRestValue,
        used: newRestValue === 0,
        employee,
        location,
        updatedAt: new Date(),
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
