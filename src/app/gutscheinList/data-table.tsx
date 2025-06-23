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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./add-coupon";
import { RedeemForm } from "./redeem-coupon-form";
import { Coupon } from "./columns";
import { createColumns } from "./columns";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

// Create a context to pass the default location
const LocationContext = React.createContext<
  "Braugasse" | "Transit" | "Pit Stop" | "Wirges" | "Büro" | "Eiswagen" | null
>(null);

// Authentication wrapper component
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [defaultLocation, setDefaultLocation] = useState<
    "Braugasse" | "Transit" | "Pit Stop" | "Wirges" | "Büro" | "Eiswagen" | null
  >(null);

  // Check if already authenticated on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem("gutschein-auth");
    const savedLocation = localStorage.getItem("gutschein-location");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      if (savedLocation) {
        setDefaultLocation(
          savedLocation as
            | "Braugasse"
            | "Transit"
            | "Pit Stop"
            | "Wirges"
            | "Büro"
            | "Eiswagen"
        );
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    // Define location passwords
    const locationPasswords: Record<
      string,
      "Braugasse" | "Transit" | "Pit Stop" | "Wirges" | "Büro" | "Eiswagen"
    > = {
      braugasse: "Braugasse",
      transit: "Transit",
      pitstop: "Pit Stop",
      wirges: "Wirges",
      büro: "Büro",
      büro1: "Büro", // Alternative spelling
      eiswagen: "Eiswagen",
    };

    const lowerPassword = password.toLowerCase();

    // Check if password matches any location
    if (locationPasswords[lowerPassword]) {
      const location = locationPasswords[lowerPassword];
      localStorage.setItem("gutschein-auth", "true");
      localStorage.setItem("gutschein-location", location);
      setIsAuthenticated(true);
      setDefaultLocation(location);
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
            <p className="mt-1 text-xs text-gray-500">
              Verwenden Sie Ihr Standort-spezifisches Passwort
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

  return (
    <LocationContext.Provider value={defaultLocation}>
      {children}
    </LocationContext.Provider>
  );
};

// Internal DataTable component that consumes the context
function DataTableInternal({
  columns,
  data,
}: {
  columns: ColumnDef<Coupon>[];
  data: Coupon[];
}): JSX.Element {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [searchValue, setSearchValue] = useState<string>("");
  const [isOldCouponDialogOpen, setIsOldCouponDialogOpen] = useState(false);
  const [couponType, setCouponType] = useState<string>("value");
  const [isRedeemReady, setIsRedeemReady] = useState(false);
  const [createdCoupon, setCreatedCoupon] = useState<Coupon | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [nextRefreshTime, setNextRefreshTime] = useState<Date>(
    new Date(Date.now() + 7200000)
  ); // 2 hours in milliseconds

  const [typeDialogOpen, setTypeDialogOpen] = useState(false);

  // Get the default location from context
  const defaultLocation = React.useContext(LocationContext);

  // Create columns with defaultLocation
  const columnsWithLocation = React.useMemo(
    () => createColumns(defaultLocation || undefined) as ColumnDef<Coupon>[],
    [defaultLocation]
  );

  const handleValueCouponSelect = () => {
    setCouponType("value");
    setTypeDialogOpen(false);
    setIsOldCouponDialogOpen(true);
  };

  const handleKleinBecherSelect = () => {
    setCouponType("klein");
    setTypeDialogOpen(false);
    setIsOldCouponDialogOpen(true);
  };
  const table = useReactTable({
    data,
    columns: columnsWithLocation,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      exact: (row, columnId, filterValue) => {
        const rowValue = String(row.getValue(columnId)).toLowerCase();
        return rowValue === String(filterValue.value).toLowerCase();
      },
    },
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 4,
      },
    },
  });

  useEffect(() => {
    // Effect for isRedeemReady changes
  }, [isRedeemReady]);

  useEffect(() => {
    const handleShake = () => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 1000);
    };

    window.addEventListener("shakeTable", handleShake);
    return () => window.removeEventListener("shakeTable", handleShake);
  }, []);

  // Set up automatic refresh every two hours, but only between 10 AM and 7 PM
  useEffect(() => {
    // Function to perform the refresh
    const performRefresh = () => {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();

      // Only refresh if it's between 10 AM and 7 PM
      if (currentHour >= 10 && currentHour < 20) {
        console.log("Auto-refreshing data after 10 AM...");
        setIsRefreshing(true);

        // Trigger the shake animation for visual feedback
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 1000);

        router.refresh();

        // Update the last refresh time
        setLastRefreshTime(new Date());

        // Calculate and update the next refresh time (2 hours from now)
        const nextTime = new Date();
        nextTime.setHours(nextTime.getHours() + 2);
        setNextRefreshTime(nextTime);

        // Reset the refreshing state after a delay
        setTimeout(() => {
          setIsRefreshing(false);
        }, 1500);
      } else {
        console.log(
          "Skipping auto-refresh outside business hours",
          isRefreshing,
          lastRefreshTime,
          nextRefreshTime
        );

        // If it's before 10 AM, set the next refresh time to 10 AM today
        const nextTime = new Date();
        nextTime.setHours(10, 0, 0, 0);

        // If it's already past 7 PM, set it to 10 AM tomorrow
        if (currentHour >= 19) {
          nextTime.setDate(nextTime.getDate() + 1);
        }

        setNextRefreshTime(nextTime);
      }
    };

    // Perform an initial check when the component mounts
    performRefresh();

    // Set up the interval for every 2 hours (7,200,000 ms)
    const refreshInterval = setInterval(performRefresh, 7200000);

    // Clean up the interval when component unmounts
    return () => clearInterval(refreshInterval);
  }, [router]);

  return (
    <div className={isShaking ? "animate-shake" : ""}>
      <div>
        <div className="flex items-center py-7">
          <DataTableToolbar
            table={table}
            data={data}
            isRedeemReady={isRedeemReady}
            onSearchChange={setSearchValue}
            defaultLocation={defaultLocation || undefined}
            onRefresh={() => {
              setLastRefreshTime(new Date());
              // Calculate and update the next refresh time (2 hours from now)
              const nextTime = new Date();
              nextTime.setHours(nextTime.getHours() + 2);
              setNextRefreshTime(nextTime);
            }}
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
              {table.getRowModel().rows?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center">
                    <Dialog
                      open={typeDialogOpen}
                      onOpenChange={setTypeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="mx-auto bg-[#FDC30A] hover:bg-[#e3af09] text-black">
                          Alten Gutschein einlösen
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="p-5 gap-5 max-w-[95vw] w-[496px] mx-auto mt-2 top-0 translate-y-0 overflow-y-auto max-h-[90vh] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-fit">
                        <DialogHeader>
                          <DialogTitle>Gutschein-Typ wählen</DialogTitle>
                          <Separator className="my-3" />
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            onClick={handleValueCouponSelect}
                            className="h-12 w-full flex flex-col bg-gradient-to-r from-[#FDC30A] to-[#FFD700] text-[#333333] font-semibold ">
                            Normal
                          </Button>
                          <Button
                            onClick={handleKleinBecherSelect}
                            className="h-12 w-full flex flex-col bg-gradient-to-r from-[#FFD700] to-[#FDC30A] text-[#333333] font-semibold">
                            Klein Becher
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={isOldCouponDialogOpen}
                      onOpenChange={setIsOldCouponDialogOpen}>
                      <DialogContent
                        onPointerDownOutside={(e) => e.preventDefault()}
                        className="p-4 gap-2 mx-auto mt-2 top-0 translate-y-0 overflow-y-auto max-h-[90vh]"
                        style={{
                          width: "fit-content",
                          transition: "width 0.3s ease",
                        }}
                        aria-describedby={undefined}>
                        <DialogHeader>
                          <DialogTitle>Gutschein Daten eintragen</DialogTitle>
                          <Separator className="my-4" />
                        </DialogHeader>
                        <ProfileForm
                          setIsRedeemReady={setIsRedeemReady}
                          setDialogOpen={setIsOldCouponDialogOpen}
                          setCreatedCoupon={setCreatedCoupon}
                          useSimpleSchema={true}
                          couponType={couponType}
                          defaultId={searchValue}
                          defaultLocation={defaultLocation || undefined}
                        />
                      </DialogContent>
                    </Dialog>

                    {isRedeemReady && (
                      <Dialog
                        open={isRedeemReady}
                        onOpenChange={setIsRedeemReady}>
                        {createdCoupon == null ? (
                          <DialogContent
                            className="flex p-4 [&>button]:hidden max-w-[95vw] w-[496px] mx-auto mt-2 top-0 translate-y-0 overflow-y-auto "
                            style={
                              couponType == "value"
                                ? { width: "496.06px", height: "300.75px" }
                                : { width: "470.92px", height: "202.77px" }
                            }
                            onPointerDownOutside={(e) => e.preventDefault()}
                            aria-describedby={undefined}>
                            <div className="flex-1 flex items-center justify-center">
                              <DialogHeader>
                                <DialogTitle></DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col items-center">
                                <Icons.spinner className="h-12 w-12 animate-spin" />
                                <p className="text-sm text-muted-foreground mt-2">
                                  Einen Moment bitte...
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        ) : (
                          <DialogContent
                            className="flex flex-col p-4 gap-6 max-w-[95vw] w-full mx-auto mt-2 top-0 translate-y-0 max-h-[90vh] lg:max-w-fit"
                            onPointerDownOutside={(e) => e.preventDefault()}
                            aria-describedby={undefined}>
                            <div className="flex-1">
                              <DialogHeader>
                                <DialogTitle>
                                  <div className="flex justify-around">
                                    <span className="text-sm font-medium">
                                      Nummer{" "}
                                      <span className="text-base font-bold">
                                        {createdCoupon.id}
                                      </span>
                                    </span>
                                    {createdCoupon.couponType === "value" && (
                                      <span className="text-sm font-medium">
                                        Betrag{" "}
                                        <span className="text-base font-bold">
                                          {formatCurrency(
                                            createdCoupon.restValue
                                          )}{" "}
                                        </span>
                                      </span>
                                    )}
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
                                couponType={couponType}
                                defaultLocation={defaultLocation || undefined}
                              />
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length === 1 ? (
                table.getRowModel().rows.map((row) => (
                  <>
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
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center">
                        <Dialog
                          open={typeDialogOpen}
                          onOpenChange={setTypeDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="mx-auto bg-[#FDC30A] hover:bg-[#e3af09] text-black">
                              Alten Gutschein einlösen
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="p-5 gap-5 max-w-[95vw] w-[496px] mx-auto mt-2 top-0 translate-y-0 overflow-y-auto max-h-[90vh] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-fit">
                            <DialogHeader>
                              <DialogTitle>Gutschein-Typ wählen</DialogTitle>
                              <Separator className="my-3" />
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4">
                              <Button
                                onClick={handleValueCouponSelect}
                                className="h-12 w-full flex flex-col bg-gradient-to-r from-[#FDC30A] to-[#FFD700] text-[#333333] font-semibold ">
                                Normal
                              </Button>
                              <Button
                                onClick={handleKleinBecherSelect}
                                className="h-12 w-full flex flex-col bg-gradient-to-r from-[#FFD700] to-[#FDC30A] text-[#333333] font-semibold">
                                Klein Becher
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Dialog
                          open={isOldCouponDialogOpen}
                          onOpenChange={setIsOldCouponDialogOpen}>
                          <DialogContent
                            onPointerDownOutside={(e) => e.preventDefault()}
                            className="p-4 gap-2 mx-auto mt-2 top-0 translate-y-0 overflow-y-auto max-h-[90vh]"
                            style={{
                              width: "fit-content",
                              transition: "width 0.3s ease",
                            }}
                            aria-describedby={undefined}>
                            <DialogHeader>
                              <DialogTitle>
                                Gutschein Daten eintragen
                              </DialogTitle>
                              <Separator className="my-4" />
                            </DialogHeader>
                            <ProfileForm
                              setIsRedeemReady={setIsRedeemReady}
                              setDialogOpen={setIsOldCouponDialogOpen}
                              setCreatedCoupon={setCreatedCoupon}
                              useSimpleSchema={true}
                              couponType={couponType}
                              defaultId={searchValue}
                              defaultLocation={defaultLocation || undefined}
                            />
                          </DialogContent>
                        </Dialog>

                        {isRedeemReady && (
                          <Dialog
                            open={isRedeemReady}
                            onOpenChange={setIsRedeemReady}>
                            {createdCoupon == null ? (
                              <DialogContent
                                className="flex p-4 [&>button]:hidden max-w-[95vw] w-[496px] mx-auto mt-2 top-0 translate-y-0 overflow-y-auto "
                                style={
                                  couponType == "value"
                                    ? {
                                        width: "496.06px",
                                        height: "300.75px",
                                      }
                                    : {
                                        width: "470.92px",
                                        height: "202.77px",
                                      }
                                }
                                onPointerDownOutside={(e) => e.preventDefault()}
                                aria-describedby={undefined}>
                                <div className="flex-1 flex items-center justify-center">
                                  <DialogHeader>
                                    <DialogTitle></DialogTitle>
                                  </DialogHeader>
                                  <div className="flex flex-col items-center">
                                    <Icons.spinner className="h-12 w-12 animate-spin" />
                                    <p className="text-sm text-muted-foreground mt-2">
                                      Einen Moment bitte...
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            ) : (
                              <DialogContent
                                className="flex flex-col p-4 gap-6 max-w-[95vw] w-full mx-auto mt-2 top-0 translate-y-0 max-h-[90vh] lg:max-w-fit"
                                onPointerDownOutside={(e) => e.preventDefault()}
                                aria-describedby={undefined}>
                                <div className="flex-1">
                                  <DialogHeader>
                                    <DialogTitle>
                                      <div className="flex justify-around">
                                        <span className="text-sm font-medium">
                                          Nummer{" "}
                                          <span className="text-base font-bold">
                                            {createdCoupon.id}
                                          </span>
                                        </span>
                                        {createdCoupon.couponType ===
                                          "value" && (
                                          <span className="text-sm font-medium">
                                            Betrag{" "}
                                            <span className="text-base font-bold">
                                              {formatCurrency(
                                                createdCoupon.restValue
                                              )}{" "}
                                            </span>
                                          </span>
                                        )}
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
                                    couponType={couponType}
                                    defaultLocation={
                                      defaultLocation || undefined
                                    }
                                  />
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  </>
                ))
              ) : (
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
    </div>
  );
}

// Export the wrapped component
export function DataTable({
  columns,
  data,
}: {
  columns: ColumnDef<Coupon>[];
  data: Coupon[];
}) {
  return (
    <AuthWrapper>
      <DataTableInternal columns={columns} data={data} />
    </AuthWrapper>
  );
}
