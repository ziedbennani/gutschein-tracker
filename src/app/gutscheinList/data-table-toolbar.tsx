"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Button } from "./../../components/ui/button";
import { Input } from "./../../components/ui/input";
import AddCoupon from "./add-coupon";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCw, Search } from "lucide-react";
import confetti from "canvas-confetti";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  data: TData[];
  isRedeemReady: boolean;
  // createdCoupon: Coupon | null;
}

export function DataTableToolbar<TData>({
  table,
  isRedeemReady,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isRedeemReady) {
      table.resetColumnFilters();
      console.log("isRedeemReady", isRedeemReady);
    }
  }, [isRedeemReady]);

  const schoolPride = () => {
    const end = Date.now() + 1 * 1000; // run for 1 second

    const colors = ["#FDC30A", "#6D676E"]; // using your theme colors, you can adjust these

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 50,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 50,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  return (
    <div className="flex items-center my-4">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative flex-1 max-w-48">
          <Input
            className="pl-9 w-full"
            placeholder="Gutschein Nummer"
            value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table.getColumn("id")?.setFilterValue(event.target.value);
            }}
          />
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3">
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}

        <AddCoupon />
        <Button
          variant="outline"
          className="flex h-[38px] text-[#57b8d6] bg-[#f0fcff] border-[#dbf6ff] border-2"
          onClick={() => {
            setIsRefreshing(true);
            schoolPride();

            router.refresh();
            setTimeout(() => {
              setIsRefreshing(false);
            }, 2000);
          }}>
          Refresh
          <RotateCw
            className={`h-4 w-4 ${
              isRefreshing ? "animate-spin [animation-duration:0.5s]" : ""
            }`}
          />
        </Button>
      </div>
    </div>
  );
}
