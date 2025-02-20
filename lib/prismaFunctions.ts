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
<<<<<<< HEAD
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

=======
    // Test database connection
    await prisma.$connect();
    console.log("Database connected successfully in getCoupons");

    const coupons = await prisma.coupon.findMany();
    console.log("Fetched coupons:", coupons);

>>>>>>> a66066f7a64d2dda07acdacb867f8832cd2f4063
    if (!coupons) return [];

    return coupons.map((coupon: PrismaCoupon) => ({
      ...coupon,
      firstValue: coupon.firstValue,
      usedValue: coupon.usedValue,
      restValue: coupon.restValue,
      updatedAt: coupon.updatedAt.toISOString(),
      createdAt: coupon.createdAt.toISOString(),
<<<<<<< HEAD
      location: coupon.location as
        | "Braugasse"
        | "Transit"
        | "Pit Stop"
        | "Wirges"
        | undefined,
    }));
  } catch (error) {
    // Ensure error is properly formatted before logging
    console.error(
      "Error fetching coupons:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return [];
=======
    }));
  } catch (error) {
    console.error("Error in getCoupons:", error);
    throw error; // Let the error propagate to see it in the logs
>>>>>>> a66066f7a64d2dda07acdacb867f8832cd2f4063
  }
}
