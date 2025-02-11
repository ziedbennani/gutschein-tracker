import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Creating coupon with data:", data);

    const coupon = await prisma.coupon.create({
      data: {
        ...data,
      },
    });

    console.log("Created coupon:", coupon);
    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
