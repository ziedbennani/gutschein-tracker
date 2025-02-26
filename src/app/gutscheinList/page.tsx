import { columns } from "./columns";
import { DataTable } from "./data-table";

export const dynamic = "force-dynamic"; // Disable static rendering
export const revalidate = 0; // Disable cache

export default async function DemoPage() {
  try {
    // Fetch coupons from the API endpoint instead of directly from Prisma
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://gutschein-tracker.vercel.app/";
    const response = await fetch(`${baseUrl}/api/coupons`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch coupons: ${response.status}`);
    }

    const result = await response.json();
    const data = result.data || [];

    return (
      <div className="container mx-auto py-8">
        <DataTable columns={columns} data={data} />
      </div>
    );
  } catch (error) {
    console.error("Error in DemoPage:", error);
    // Return an error state or empty table
    return (
      <div className="container mx-auto py-20">
        <DataTable columns={columns} data={[]} />
      </div>
    );
  }
}
