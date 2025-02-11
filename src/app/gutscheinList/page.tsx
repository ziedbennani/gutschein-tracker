import { getCoupons } from "../../../lib/prismaFunctions";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// Add this line to disable caching
export const revalidate = 0;

export default async function DemoPage() {
  try {
    const data = await getCoupons();
    console.log("data : ", data);

    return (
      <div className="container mx-auto py-20">
        <DataTable columns={columns} data={data || []} />
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
