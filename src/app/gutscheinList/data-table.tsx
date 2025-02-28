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
import logo from "./../../../public/images/egelosia-logo.svg";
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
import { ArrowLeft, ArrowRight } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

// Authentication wrapper component
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Check if already authenticated on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem("gutschein-auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    // Use NEXT_PUBLIC_ prefix to access environment variables in client components
    if (password === process.env.NEXT_PUBLIC_PASSWORD) {
      localStorage.setItem("gutschein-auth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Falsches Passwort");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-md space-y-8 p-10">
          <div className="text-center justify-items-center">
            <Image src={logo} alt="logo" priority />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Gutschein System
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Bitte geben Sie das Passwort ein
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center">
                  <Icons.spinner className="h-12 w-12 animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleLogin();
                      }
                    }}
                  />
                  <Button
                    onClick={handleLogin}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md bg-[#FDC30A] hover:bg-[#e3af09] text-black">
                    Einloggen
                  </Button>
                </div>
              )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

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
    console.log("isRedeemReady", isRedeemReady);
  }, [isRedeemReady]);

  // Wrap the entire component with the AuthWrapper
  return (
    <AuthWrapper>
      <div>
        <div className="flex items-center py-4">
          <DataTableToolbar
            table={table}
            data={data}
            isRedeemReady={isRedeemReady}
            // createdCoupon={createdCoupon}
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
                        className="p-5 gap-5 max-w-[95vw] w-[496px] mx-auto mt-2 top-0 translate-y-0 overflow-y-auto max-h-[90vh] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-fit"
                        aria-describedby={undefined}>
                        <DialogHeader>
                          <DialogTitle>Alten Gutschein eintragen</DialogTitle>
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

                    {isRedeemReady && (
                      <Dialog
                        open={isRedeemReady}
                        onOpenChange={setIsRedeemReady}>
                        {isRedeemReady && createdCoupon != null ? (
                          <DialogContent
                            className="flex p-4 gap-4 max-w-[95vw] w-full mx-auto mt-2 top-0 translate-y-0 overflow-y-auto max-h-[90vh] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-fit"
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
                                        {formatCurrency(
                                          createdCoupon.restValue
                                        )}{" "}
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
                            className="flex p-4 [&>button]:hidden max-w-[95vw] w-[496px] mx-auto mt-2 top-0 translate-y-0 overflow-y-auto "
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
            size="lg"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            <ArrowLeft />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            <ArrowRight />
          </Button>
        </div>
      </div>
    </AuthWrapper>
  );
}
