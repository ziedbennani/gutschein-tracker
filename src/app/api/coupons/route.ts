import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Creating coupon with data:", data);

    // Test database connection
    await prisma.$connect();
    console.log("Database connected successfully");

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
<<<<<<< HEAD
=======

    console.log("Created coupon:", coupon);
    return NextResponse.json(coupon);
>>>>>>> a66066f7a64d2dda07acdacb867f8832cd2f4063
  } catch (error) {
    console.error("Error creating coupon:", error);
    // Log the full error
    console.error("Full error:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}
