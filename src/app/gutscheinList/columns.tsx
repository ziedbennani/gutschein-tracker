"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";

import { useEffect, useState } from "react";
import { RedeemForm } from "./redeem-coupon-form";
import { formatCurrency } from "./utils";

export interface Coupon {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  employee: string;
  description: string;
  oldSystem: boolean;
  firstValue: number | null;
  usedValue: number | null;
  restValue: number;
  used: boolean;
  location: string | null;
  extraPayment: number | null;
  oldId: string | null;
  tip: number | null;
  couponType: string;
}

// Add RedeemCouponDialog component
const RedeemCouponDialog = ({
  coupon,
  isOpen,
  setIsOpen,
  onCouponRedeemed,
}: {
  coupon: Coupon;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCouponRedeemed: (couponId: string) => void;
}) => {
  useEffect(() => {
    console.log("isOpen[column.tsx] changed to: ", isOpen);
  }, [isOpen]);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                  <span className="text-base font-bold">{coupon.id}</span>
                </span>
                {coupon.couponType === "value" && (
                  <span className="text-sm font-medium">
                    Betrag{" "}
                    <span className="text-base font-bold">
                      {formatCurrency(coupon.restValue)}{" "}
                    </span>
                  </span>
                )}
              </div>
              <Separator className="my-3" />
            </DialogTitle>
          </DialogHeader>

          <RedeemForm
            coupon={coupon}
            setDialogOpen={setIsOpen}
            onCouponRedeemed={onCouponRedeemed}
            couponType={coupon.couponType}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const columns: ColumnDef<Coupon>[] = [
  {
    accessorKey: "id",
    header: "Nummer",
    filterFn: (row, columnId, filterValue) => {
      const rowValue = String(row.getValue(columnId)).toLowerCase();
      const searchValue = String(filterValue).toLowerCase();
      return rowValue.startsWith(searchValue);
    },
  },
  {
    accessorKey: "firstValue",
    header: "Erster Betrag",
    cell: (row) => {
      const couponType = row.row.original.couponType;
      const value = row.getValue() as number;
      return couponType === "klein"
        ? "klein Becher "
        : value
        ? formatCurrency(value)
        : "-";
    },
  },
  {
    accessorKey: "usedValue",
    header: "Eingelöst",
    cell: (row) => {
      const couponType = row.row.original.couponType;
      const value = row.getValue() as number;
      return couponType === "value"
        ? formatCurrency(value)
        : row.row.original.used === true
        ? "klein Becher"
        : "-";
    },
  },
  {
    accessorKey: "restValue",
    header: "Aktuell",
    cell: (row) => {
      const couponType = row.row.original.couponType;
      console.log("row", row.row.original);
      const value = row.getValue() as number;
      console.log("value", value);
      return couponType === "value"
        ? formatCurrency(value)
        : row.row.original.used === false
        ? "klein Becher"
        : "-";
    },
  },
  {
    accessorKey: "employee",
    header: "Mitarbeiter",
  },
  {
    accessorKey: "updatedAt",
    header: "Datum",
    cell: (row) => {
      const dateValue = row.getValue() as string;
      const FirstOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      };
      const SecondOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
      };
      const formattedDate = new Intl.DateTimeFormat(
        "de-DE",
        FirstOptions
      ).format(new Date(dateValue));
      const formattedTime = new Intl.DateTimeFormat(
        "de-DE",
        SecondOptions
      ).format(new Date(dateValue));

      return `${formattedDate},  ${formattedTime}`; // Format the date as needed
    },
  },
  {
    id: "actions",
    header: "Options",
    cell: function CouponCell({ row }) {
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const coupon = row.original;

      const handleCouponRedeemed = (couponId: string) => {
        console.log(`Call from column.tsx: Coupon redeemed: ${couponId}`);
      };

      if (coupon.used) {
        return (
          <Button
            variant="secondary"
            size="sm"
            className="text-gray-500 p-2.5 bg-gray-100">
            Eingelöst
          </Button>
        );
      }

      return (
        <div className="flex items-center gap-2 w-fit">
          <Button
            variant="secondary"
            size="sm"
            className="bg-[#FDC30A] hover:bg-[#e3af09] text-black"
            onClick={() => setIsDialogOpen(true)}>
            Einlösen
          </Button>
          <RedeemCouponDialog
            coupon={coupon}
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            onCouponRedeemed={handleCouponRedeemed}
          />
        </div>
      );
    },
  },
];
