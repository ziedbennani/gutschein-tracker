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
  onRefresh?: () => void;
  // createdCoupon: Coupon | null;
}

export function DataTableToolbar<TData>({
  table,
  isRedeemReady,
  onRefresh,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

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
        particleCount: 10,
        angle: 60,
        spread: 100,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 10,
        angle: 120,
        spread: 100,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const shakeScreen = () => {
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      schoolPride();
      console.log("shaking", isShaking);
    }, 1000); // Reset after animation
  };

  return (
    <div className="flex items-center justify-between">
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
        <div className="flex flex-col items-end">
          <Button
            variant="outline"
            className="flex h-[38px] bg-gradient-to-r from-[#FDC30A] to-[#FFD700] text-[#333333] font-medium border-[#E0B000] border hover:from-[#FFD700] hover:to-[#FDC30A] hover:shadow-md transition-all"
            onClick={() => {
              setIsRefreshing(true);
              shakeScreen();
              // Emit shake event to parent component
              window.dispatchEvent(new CustomEvent("shakeTable"));

              router.refresh();
              // Call the onRefresh callback to update lastRefreshTime in parent
              onRefresh?.();

              setTimeout(() => {
                setIsRefreshing(false);
              }, 1000);
            }}>
            Refresh
            <RotateCw
              className={`h-4 w-4 ml-2 ${
                isRefreshing ? "animate-spin [animation-duration:0.3s]" : ""
              }`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
