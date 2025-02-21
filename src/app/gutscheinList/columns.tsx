"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./add-coupon";

import { useState } from "react";
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
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="flex p-4 gap-12 max-w-fit mx-auto"
        aria-describedby={undefined}
        // style={isOpen ? customOverlayStyles : undefined}
      >
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

        {/* <div className="flex-1">
          <DialogHeader>
            <DialogTitle>
              Neu Gutschein <Separator className="my-4" />
            </DialogTitle>
          </DialogHeader>
          <ProfileForm setDialogOpen={setIsOpen} />
        </div> */}
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
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const formattedDate = new Intl.DateTimeFormat("de-DE", options).format(
        new Date(dateValue)
      );

      return formattedDate; // Format the date as needed
    },
  },
  {
    id: "actions",
    header: "Options",
    cell: function CouponCell({ row }) {
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const coupon = row.original;

      const handleCouponRedeemed = (couponId: string) => {
        // Logic for handling coupon redemption
        console.log(`Call from column.tsx: Coupon redeemed: ${couponId}`);
        // You can also add any additional logic here, like updating state or showing a toast
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
