"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  id: z
    .string()
    .min(2, "Nummer ist erforderlich")
    .transform((val) => val.toUpperCase())
    .refine(
      async (id) => {
        const response = await fetch(`/api/coupons/check-id?id=${id}`);
        const { exists } = await response.json();
        return !exists;
      },
      { message: "Diese Nummer existiert bereits" }
    ),
  firstValue: z.number({
    required_error: "Betrag ist erforderlich",
    invalid_type_error: "Betrag muss eine Zahl sein",
  }),
  employee: z.string().min(1, "Mitarbeiter ist erforderlich"),
  location: z.enum(["Braugasse", "Transit", "Pit Stop", "Wirges"], {
    required_error: "Laden ist erforderlich",
  }),
});

// Add prop type definition
interface ProfileFormProps {
  setDialogOpen: (open: boolean) => void;
}

export function ProfileForm({ setDialogOpen }: ProfileFormProps) {
  const router = useRouter();
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      firstValue: undefined,
      employee: "",
      location: undefined,
    },
    mode: "onChange", // This enables validation as the user types
  });

  // Watch firstValue and usedValue
  const { setValue, watch } = form;
  const firstValue = watch("firstValue");
  // const usedValue = watch("usedValue");

  // Update restValue whenever firstValue or usedValue changes
  // useEffect(() => {
  //   const restValue = (firstValue ?? 0) - (usedValue ?? 0);
  //   setValue("restValue", restValue);
  // }, [firstValue, usedValue, setValue]);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          oldSystem: false,
          description: "",
          used: false,
          restValue: values.firstValue || 0,
        }),
      });

      if (!response.ok) throw new Error("Failed to create coupon");

      setDialogOpen(false); // Close dialog after successful submission
      router.refresh(); // Refresh the page to show new data
    } catch (error) {
      console.error("Error creating coupon:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nummer</FormLabel>
                  <FormControl>
                    <Input placeholder="EF1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="firstValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Betrag</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="10,00 €"
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        {/* <div className="grid gap-3">
          <FormField
            control={form.control}
            name="usedValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Eingelöster Betrag</FormLabel>
                <FormControl>
                  <Input
                    placeholder="2,50 €"
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div> */}
        <div className="flex gap-4">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="employee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mitarbeiter</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Laden</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wähle einen Laden" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Braugasse">Braugasse</SelectItem>
                      <SelectItem value="Transit">Transit</SelectItem>
                      <SelectItem value="Pit Stop">Pit Stop</SelectItem>
                      <SelectItem value="Wirges">Wirges</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

const AddCoupon = ({ data }: any) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {/* <Dialog> */}
      <DialogTrigger asChild>
        <Button onClick={() => console.log("data : ", data)}>
          Gutschein Erstellen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Neu Gutschein <Separator className="my-4" />
          </DialogTitle>
          <DialogDescription>Bitte alle Felder ausfüllen</DialogDescription>
        </DialogHeader>

        {/* <ProfileForm /> */}
        <ProfileForm setDialogOpen={setDialogOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default AddCoupon;
