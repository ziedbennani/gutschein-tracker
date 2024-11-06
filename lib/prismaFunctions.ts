import { Coupon } from "@/app/gutscheinList/columns";
import prisma from "./db";

export async function getCoupons(): Promise<Coupon[]> {
  const coupons = await prisma.coupon.findMany();

  return coupons.map((coupon) => ({
    ...coupon,
    firstValue: coupon.firstValue,
    usedValue: coupon.usedValue,
    restValue: coupon.restValue,
    updatedAt: coupon.updatedAt.toISOString(), // Serialize as ISO string
    createdAt: coupon.createdAt.toISOString(), // Serialize as ISO string
  }));
}
