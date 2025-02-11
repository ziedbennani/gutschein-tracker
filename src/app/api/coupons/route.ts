import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const coupon = await prisma.coupon.create({
      data: {
        ...data,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
