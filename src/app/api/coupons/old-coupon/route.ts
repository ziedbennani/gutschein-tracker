import { NextResponse } from "next/server";
import prisma from "../../../../../lib/db";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("data from old coupon", data);

    // Ensure all required fields are present
    const couponData = {
      ...data,
      description:
        data.couponType === "klein"
          ? `kl.Becher von ${new Date(
              data.createdAt
            ).getFullYear()} gespeichert`
          : `ALTER G. mit ${data.restValue} € gespeichert`,
      // Set default values for required fields if not provided
      employee: data.employee || " ",
      oldSystem: true,
      used: data.used !== undefined ? data.used : false,
      couponType: data.couponType,
      // For klein coupons, ensure numeric fields are set properly
      firstValue: data.couponType === "klein" ? null : data.firstValue,
      // data.firstValue !== undefined
      //   ? data.firstValue
      //   : data.couponType === "klein"
      //   ? null
      //   : null,
      usedValue: data.couponType === "klein" ? null : data.usedValue,
      // data.usedValue !== undefined
      //   ? data.usedValue
      //   : data.couponType === "klein"
      //   ? null
      //   : null,
      restValue: data.couponType === "klein" ? null : data.restValue,
      // data.restValue !== undefined
      //   ? data.restValue
      //   : data.couponType === "klein"
      //   ? null
      //   : null,
    };

    // Use a transaction to create both the coupon and its history entry
    const result = await prisma.$transaction(async (tx) => {
      // Create the coupon first
      const coupon = await tx.coupon.create({
        data: couponData,
      });

      // Then create a history entry for this coupon
      const historyEntry = await tx.couponHistory.create({
        data: {
          couponId: coupon.id,
          employee: coupon.employee,
          description:
            data.couponType === "klein"
              ? `kl.Becher von ${new Date(
                  coupon.createdAt
                ).getFullYear()} gespeichert `
              : `ALTER G. mit ${coupon.restValue} € gespeichert`,
          oldSystem: coupon.oldSystem,
          oldId: coupon.oldId,
          firstValue: coupon.firstValue,
          usedValue: coupon.usedValue,
          restValue: coupon.restValue,
          used: coupon.used,
          location: coupon.location,
          extraPayment: coupon.extraPayment,
          tip: coupon.tip,
          couponType: coupon.couponType,
        },
      });

      return { coupon, historyEntry };
    });

    console.log("old coupon created:", result.coupon);
    console.log("history entry created:", result.historyEntry);

    // Revalidate the coupons list page after creating an old coupon
    revalidatePath("/gutscheinList");

    return NextResponse.json(
      {
        success: true,
        data: {
          coupon: result.coupon,
          historyEntry: result.historyEntry,
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
