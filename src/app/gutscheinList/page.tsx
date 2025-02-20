<<<<<<< HEAD
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCoupons } from "../../../lib/prismaFunctions";
=======
"use client";

import { useEffect, useState } from "react";
>>>>>>> a66066f7a64d2dda07acdacb867f8832cd2f4063
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Coupon } from "./columns";

export default function DemoPage() {
  const [data, setData] = useState<Coupon[]>([]);

  async function fetchCoupons() {
    try {
      const response = await fetch("/api/coupons");
      const coupons = await response.json();
      console.log("Fetched coupons:", coupons);
      setData(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setData([]);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="container mx-auto py-20">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
