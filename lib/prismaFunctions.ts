import { Coupon } from "@/app/gutscheinList/columns";
import { prisma } from "./db";
import { Coupon as PrismaCoupon } from "@prisma/client";

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

testConnection();

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const coupons = await prisma.coupon.findMany();
    console.log("Fetched coupons:", coupons);

    if (!coupons) return []; // Return empty array instead of null

    return coupons.map((coupon: PrismaCoupon) => ({
      ...coupon,
      firstValue: coupon.firstValue,
      usedValue: coupon.usedValue,
      restValue: coupon.restValue,
      updatedAt: coupon.updatedAt.toISOString(), // Serialize as ISO string
      createdAt: coupon.createdAt.toISOString(), // Serialize as ISO string
    }));
  } catch (error) {
    // Ensure error is properly formatted before logging
    console.error(
      "Error fetching coupons:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return []; // Return empty array on error
  }
}
