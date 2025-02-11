"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { useState } from "react";
import { RedeemForm } from "./redeem-coupon-form";

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
};

// Add RedeemCouponDialog component
const RedeemCouponDialog = ({
  coupon,
  isOpen,
  setIsOpen,
}: {
  coupon: Coupon;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>
            Gutschein Einlösen
            <Separator className="my-4" />
          </DialogTitle>

          <DialogDescription className="text-base font-medium">
            Gutschein Nummer: {coupon.id}
            <br />
            Restbetrag:{" "}
            {new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "EUR",
            }).format(coupon.restValue)}
          </DialogDescription>
        </DialogHeader>
        <RedeemForm coupon={coupon} setDialogOpen={setIsOpen} />
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
      const formatted = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(value);

      return row.getValue() ? formatted : "-";
    },
  },
  {
    accessorKey: "usedValue",
    header: "Eingelöster Betrag",
    cell: (row) => {
      const value = row.getValue() as number;
      const formatted = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(value);
      return formatted;
    },
  },
  {
    accessorKey: "restValue",
    header: "Aktueller Betrag",
    cell: (row) => {
      const value = row.getValue() as number;
      const formatted = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(value);
      return formatted;
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
          />
        </div>
      );
    },
  },
];
