import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        description: `${data.firstValue} € Gutschein erstellt von ${data.employee}`,
      },
    });
    console.log("coupon created :", coupon);
    return NextResponse.json({
      success: true,
      data: {
        coupon: coupon,
      },
    });
  } catch (error) {
    // Log the full error
    console.error("Full error:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
