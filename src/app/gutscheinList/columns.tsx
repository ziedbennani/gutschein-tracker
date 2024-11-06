"use client";

import { ColumnDef } from "@tanstack/react-table";

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

export const columns: ColumnDef<Coupon>[] = [
  {
    accessorKey: "id",
    header: "Nummer",
  },
  {
    accessorKey: "firstValue",
    header: "Anfangsbetrag",
  },
  {
    accessorKey: "usedValue",
    header: "Eingelöster Betrag",
  },
  {
    accessorKey: "restValue",
    header: "Rest Betrag",
  },
  {
    accessorKey: "employee",
    header: "Mitarbeiter",
  },
  {
    accessorKey: "updatedAt",
    header: "letzte Änderung",
  },
];
