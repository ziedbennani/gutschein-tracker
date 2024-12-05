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
    header: "Restbetrag",
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
    accessorKey: "",
    header: "Options",
  },
];
