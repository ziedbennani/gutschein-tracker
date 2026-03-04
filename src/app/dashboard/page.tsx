import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://gutschein-tracker.vercel.app/");

    const response = await fetch(`${baseUrl}/api/dashboard`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.status}`);
    }

    const data = await response.json();

    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Dashboard Gutscheins
        </h1>
        <DashboardClient locations={data.locations} />
      </div>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Dashboard Gutscheins
        </h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">
            Erreur lors du chargement du dashboard.
          </p>
        </div>
      </div>
    );
  }
}
