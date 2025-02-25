"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Button } from "./../../components/ui/button";
import { Input } from "./../../components/ui/input";
import AddCoupon from "./add-coupon";
import { useEffect } from "react";
import { Coupon } from "./columns";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  data: TData[];
  createdCoupon: Coupon | null;
}

export function DataTableToolbar<TData>({
  table,
  createdCoupon,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  useEffect(() => {
    if (createdCoupon === null) {
      table.resetColumnFilters();
    }
  }, [table, createdCoupon]);

  return (
    <div className="flex items-center my-4">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter Nummern"
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            table.getColumn("id")?.setFilterValue(event.target.value);
          }}
          className="max-w-sm"
        />

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
      </div>
    </div>
  );
}
