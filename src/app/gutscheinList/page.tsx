import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCoupons } from "../../../lib/prismaFunctions";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function DemoPage() {
  try {
    const data = await getCoupons();

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
