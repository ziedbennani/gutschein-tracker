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

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Coupon = {
  id: string;
  firstValue: number | null;
  usedValue: number | null;
  restValue: number;
  employee: string;
  updatedAt: string;
  createdAt: string;
  description: string;
  oldSystem: boolean;
  used: boolean;
  location?: "Braugasse" | "Transit" | "Pit Stop" | "Wirges";
};

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
        className="flex flex-col p-4 gap-6 max-w-[95vw] w-full mx-auto mt-2 top-0 translate-y-0 overflow-y-auto max-h-[90vh] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-fit"
        onPointerDownOutside={(e) => e.preventDefault()}
        aria-describedby={undefined}>
        <div className="flex-1">
          <DialogHeader>
            <DialogTitle>
              <div className="flex justify-around">
                <span className="text-sm font-medium">
                  Gutschein{" "}
                  <span className="text-base font-bold">{coupon.id}</span>
                </span>
                <span className="text-sm font-medium">
                  Betrag{" "}
                  <span className="text-base font-bold">
                    {formatCurrency(coupon.restValue)}{" "}
                  </span>
                </span>
              </div>
              <Separator className="my-3" />
            </DialogTitle>
          </DialogHeader>

          <RedeemForm
            coupon={coupon}
            setDialogOpen={setIsOpen}
            onCouponRedeemed={onCouponRedeemed}
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
  },
  {
    accessorKey: "firstValue",
    header: "Anfangsbetrag",
    cell: (row) => {
      const value = row.getValue() as number;
      return value ? formatCurrency(value) : "-";
    },
  },
  {
    accessorKey: "usedValue",
    header: "Eingelöster Betrag",
    cell: (row) => {
      const value = row.getValue() as number;
      return formatCurrency(value);
    },
  },
  {
    accessorKey: "restValue",
    header: "Aktueller Betrag",
    cell: (row) => {
      const value = row.getValue() as number;
      return formatCurrency(value);
    },
  },
  {
    accessorKey: "employee",
    header: "Mitarbeiter",
  },
  {
    accessorKey: "updatedAt",
    header: "letzte Änderung",
    cell: (row) => {
      const dateValue = row.getValue() as string;
      const FirstOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
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

      return `${formattedDate} - ${formattedTime}`; // Format the date as needed
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

      return (
        <div className="flex items-center gap-2">
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
