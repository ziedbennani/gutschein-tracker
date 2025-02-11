import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.toUpperCase();

  if (!id) {
    return NextResponse.json({ exists: false });
  }

  const coupon = await prisma.coupon.findFirst({
    where: {
      id: {
        equals: id,
        mode: "insensitive",
      },
    },
  });

  return NextResponse.json({ exists: !!coupon });
}
