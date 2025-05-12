import { NextResponse } from "next/server";
import prisma from "./../../../../lib/db";
import { revalidatePath } from "next/cache";
import { Coupon } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Ensure couponType is set
    if (!data.couponType) {
      throw new Error("Coupon type is required");
    }

    // Handle Klein Becher coupon type
    const isKleinBecher = data.couponType === "klein";

    // Use provided description or generate a default one
    const description =
      data.description || (isKleinBecher ? `NEU!  kl.Becher` : `NEU!`);

    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        usedValue: 0,
        firstValue: data.firstValue,
        restValue: isKleinBecher ? null : data.firstValue,
        description: description,
        couponType: data.couponType,
      },
    });

    // Create history record for new coupon
    await prisma.couponHistory.create({
      data: {
        couponId: coupon.id,
        employee: data.employee,
        description: description,
        oldSystem: false,
        firstValue: coupon.firstValue,
        usedValue: 0,
        restValue: coupon.firstValue,
        used: false,
        location: data.location,
        couponType: data.couponType,
      },
    });

    console.log("coupon :", coupon);
    console.log("data :", data);

    // Revalidate the coupons list page after creating a new coupon
    revalidatePath("/gutscheinList");

    return NextResponse.json(
      {
        success: true,
        data: {
          coupon: coupon,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    // Log the full error
    console.error("Full error:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}

// Add a GET handler to fetch all coupons
export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      data: coupons.map((coupon: Coupon) => ({
        ...coupon,
        updatedAt: coupon.updatedAt.toISOString(),
        createdAt: coupon.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ data: [] });
  }
}
