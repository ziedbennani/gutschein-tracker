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
    // Test database connection
    await prisma.$connect();
    console.log("Database connected successfully in getCoupons");

    const coupons = await prisma.coupon.findMany();
    console.log("Fetched coupons:", coupons);

    if (!coupons) return [];

    return coupons.map((coupon: PrismaCoupon) => ({
      ...coupon,
      firstValue: coupon.firstValue,
      usedValue: coupon.usedValue,
      restValue: coupon.restValue,
      updatedAt: coupon.updatedAt.toISOString(),
      createdAt: coupon.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error in getCoupons:", error);
    throw error; // Let the error propagate to see it in the logs
  }
}
