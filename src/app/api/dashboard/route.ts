import prisma from "@lib/db";

interface HistoryEntry {
  id: string;
  couponId: string;
  date: string;
  employee: string;
  description: string;
  type: "redeemed" | "created";
  value: number;
  couponType: string;
}

interface LocationData {
  location: string;
  entries: HistoryEntry[];
  totalRedeemed: number;
  totalRedeemedCount: number;
  totalCreated: number;
  totalCreatedCount: number;
}

export async function GET() {
  try {
    const history = await prisma.couponHistory.findMany({
      orderBy: { modifiedAt: "desc" },
    });

    // Get online coupons that have no history entries
    // Online coupons are those with location="Online" OR id starting with "e"
    const couponsWithHistory = new Set(history.map((h) => h.couponId));
    const onlineCouponsNoHistory = await prisma.coupon.findMany({
      where: {
        OR: [
          { location: "Online" },
          { id: { startsWith: "e" } },
        ],
        id: {
          notIn: Array.from(couponsWithHistory),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const locations = [
      "Braugasse",
      "Transit",
      "Pit Stop",
      "Wirges",
      "Büro",
      "Eiswagen",
      "Online",
    ];

    const byLocation: Record<string, LocationData> = {};

    // Initialize all locations
    locations.forEach((loc) => {
      byLocation[loc] = {
        location: loc,
        entries: [],
        totalRedeemed: 0,
        totalRedeemedCount: 0,
        totalCreated: 0,
        totalCreatedCount: 0,
      };
    });

    // Find creation entries (oldest history entry per couponId)
    const creationCouponIds = new Set<string>();
    for (let i = history.length - 1; i >= 0; i--) {
      const h = history[i];
      if (!creationCouponIds.has(h.couponId)) {
        creationCouponIds.add(h.couponId);

        // Only show "Neu" if description contains "NEU!"
        if (!h.description.includes("NEU!")) continue;

        // Online coupons (starting with "e") always go to Online tab
        const isOnlineCoupon = h.couponId.startsWith("e");
        const loc = isOnlineCoupon ? "Online" : h.location;
        if (!loc || !byLocation[loc]) continue; // Skip if location is null or doesn't exist

        const firstValue = Number(h.firstValue) || 0;
        byLocation[loc].totalCreated += firstValue;
        byLocation[loc].totalCreatedCount += 1;
        byLocation[loc].entries.push({
          id: h.id + "-created",
          couponId: h.couponId,
          date: h.modifiedAt.toISOString().substring(0, 10),
          employee: h.employee,
          description: h.description,
          type: "created",
          value: Math.round(firstValue * 100) / 100,
          couponType: h.couponType,
        });
      }
    }

    // Process redeemed entries (usedValue > 0)
    history.forEach((h) => {
      const usedVal = Number(h.usedValue) || 0;
      if (usedVal > 0) {
        // Online coupons (starting with "e") only show in Online when created, but when redeemed show in actual location
        const loc = h.location;
        if (!loc || !byLocation[loc]) return; // Skip if location is null or doesn't exist

        byLocation[loc].totalRedeemed += usedVal;
        byLocation[loc].totalRedeemedCount += 1;
        byLocation[loc].entries.push({
          id: h.id,
          couponId: h.couponId,
          date: h.modifiedAt.toISOString().substring(0, 10),
          employee: h.employee,
          description: h.description,
          type: "redeemed",
          value: Math.round(usedVal * 100) / 100,
          couponType: h.couponType,
        });
      }
    });

    // Add online coupons with no history (created but never touched)
    onlineCouponsNoHistory.forEach((coupon) => {
      const value = Number(coupon.firstValue) || 0;
      byLocation["Online"].totalCreated += value;
      byLocation["Online"].totalCreatedCount += 1;
      byLocation["Online"].entries.push({
        id: coupon.id + "-created",
        couponId: coupon.id,
        date: coupon.createdAt.toISOString().substring(0, 10),
        employee: coupon.employee,
        description: coupon.description,
        type: "created",
        value: Math.round(value * 100) / 100,
        couponType: coupon.couponType,
      });
    });

    // Sort entries by date descending
    Object.values(byLocation).forEach((loc) => {
      loc.entries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      loc.totalRedeemed = Math.round(loc.totalRedeemed * 100) / 100;
      loc.totalCreated = Math.round(loc.totalCreated * 100) / 100;
    });

    return Response.json(
      { locations: Object.values(byLocation) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard API error:", error);
    return Response.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
