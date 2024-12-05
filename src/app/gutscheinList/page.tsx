import { getCoupons } from "../../../lib/prismaFunctions";
import { Coupon, columns } from "./columns";
import { DataTable } from "./data-table";

export default async function DemoPage() {
  const data = await getCoupons();

  return (
    <div className="container mx-auto py-20">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
