// import { Coupon } from "@/app/gutscheinList/columns";
// import prisma from "./db";
// import { Coupon as PrismaCoupon } from "@prisma/client";
// // import { PrismaClient } from "@prisma/client";

// export async function testConnection() {
//   try {
//     await prisma.$connect();
//     console.log("Database connected successfully");
//   } catch (error) {
//     console.error("Database connection failed:", error);
//   }
// }

// testConnection();

// export async function getCoupons(): Promise<Coupon[]> {
//   try {
//     const baseUrl =
//       process.env.NEXT_PUBLIC_BASE_URL ||
//       "https://gutschein-tracker.vercel.app/";
//     const response = await fetch(`${baseUrl}/api/coupons`, {
//       cache: "no-store",
//       next: { revalidate: 0 },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch coupons: ${response.status}`);
//     }

//     const result = await response.json();
//     return result.data || [];
//   } catch (error) {
//     console.error(
//       "Error fetching coupons:",
//       error instanceof Error ? error.message : "Unknown error"
//     );
//     return [];
//   }
// }
