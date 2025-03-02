import { NextResponse } from "next/server";
import prisma from "../../../../../lib/db";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("data from old coupon", data);
    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        restValue: data.restValue,
        description: `ALT! ${data.id} mit ${Number(data.restValue).toFixed(
          2
        )}€`,
      },
    });

    // Create history record for old coupon
    await prisma.couponHistory.create({
      data: {
        couponId: coupon.id,
        employee: data.employee,
        description: `ALT! ${data.id} mit ${Number(data.restValue).toFixed(
          2
        )}€`,
        oldSystem: true,
        restValue: coupon.restValue,
        used: false,
      },
    });

    console.log("old coupon created :", coupon);

    // Revalidate the coupons list page after creating an old coupon
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
