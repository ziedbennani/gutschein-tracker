import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("data from old coupon", data);
    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        description: `Alten Gutscheins Nr ${data.id} mit ${data.restValue} € hinzugefügt`,
      },
    });
    console.log("old coupon created :", coupon);
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
