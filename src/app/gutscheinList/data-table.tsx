"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./add-coupon";
import { RedeemForm } from "./redeem-coupon-form";
import { Coupon } from "./columns";

import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { DataTableToolbar } from "./data-table-toolbar";
import { formatCurrency } from "./utils";
import { Icons } from "@/components/icons";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [isOldCouponDialogOpen, setIsOldCouponDialogOpen] = useState(false);
  const [isRedeemReady, setIsRedeemReady] = useState(false);
  const [createdCoupon, setCreatedCoupon] = useState<Coupon | null>(null);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 3,
      },
    },
  });

  useEffect(() => {
    console.log("isRedeemReady[data-table.tsx] changed to: ", isRedeemReady);
  }, [isRedeemReady]);

  useEffect(() => {
    console.log("createdCoupon[data-table.tsx] changed to: ", createdCoupon);
  }, [createdCoupon]);

  return (
    <div>
      <div className="flex items-center py-4">
        <DataTableToolbar
          table={table}
          data={data}
          createdCoupon={createdCoupon}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  <Button
                    onClick={() => setIsOldCouponDialogOpen(true)}
                    variant="outline"
                    className="mx-auto bg-[#FDC30A] hover:bg-[#e3af09] text-black">
                    Alten Gutschein einlösen
                  </Button>

                  <Dialog
                    open={isOldCouponDialogOpen}
                    onOpenChange={setIsOldCouponDialogOpen}>
                    <DialogContent
                      onPointerDownOutside={(e) => e.preventDefault()}
                      className="p-5 gap-5"
                      aria-describedby={undefined}>
                      <DialogHeader>
                        <DialogTitle>Alten Gutschein hinzufügen</DialogTitle>
                        <Separator className="my-4" />
                      </DialogHeader>
                      <ProfileForm
                        setIsRedeemReady={setIsRedeemReady}
                        setDialogOpen={setIsOldCouponDialogOpen}
                        setCreatedCoupon={setCreatedCoupon}
                        useSimpleSchema={true}
                      />
                    </DialogContent>
                  </Dialog>
                  {/* {isRedeemReady && !showRedeemDialog && (
                    <Icons.spinner className="mr-2 h-8 w-8 animate-spin" />
                  )} */}

                  {isRedeemReady && (
                    <Dialog
                      open={isRedeemReady}
                      onOpenChange={setIsRedeemReady}>
                      {isRedeemReady && createdCoupon != null ? (
                        <DialogContent
                          className="flex p-4 gap-12 max-w-fit mx-auto"
                          onPointerDownOutside={(e) => e.preventDefault()}
                          aria-describedby={undefined}>
                          <div className="flex-1">
                            <DialogHeader>
                              <DialogTitle>
                                <div className="flex justify-around">
                                  <span className="text-sm font-medium">
                                    Gutschein{" "}
                                    <span className="text-base font-bold">
                                      {createdCoupon.id}
                                    </span>
                                  </span>
                                  <span className="text-sm font-medium">
                                    Betrag{" "}
                                    <span className="text-base font-bold">
                                      {formatCurrency(createdCoupon.restValue)}{" "}
                                    </span>
                                  </span>
                                </div>
                                <Separator className="my-3" />
                              </DialogTitle>
                            </DialogHeader>
                            <RedeemForm
                              coupon={createdCoupon}
                              setDialogOpen={setIsOldCouponDialogOpen}
                              onCouponRedeemed={() => {}}
                              setIsRedeemReady={setIsRedeemReady}
                              setCreatedCoupon={setCreatedCoupon}
                            />
                          </div>
                        </DialogContent>
                      ) : (
                        <DialogContent
                          className="flex p-4 [&>button]:hidden"
                          style={{ width: "518.84px", height: "300.75px" }}
                          onPointerDownOutside={(e) => e.preventDefault()}
                          aria-describedby={undefined}>
                          <div className="flex-1 flex items-center justify-center">
                            <DialogHeader>
                              <DialogTitle></DialogTitle>
                            </DialogHeader>
                            <Icons.spinner className="h-12 w-12 animate-spin" />
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}
