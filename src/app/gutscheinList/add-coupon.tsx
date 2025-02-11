"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
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

// Define your form data type (if using Zod)
type FormData = z.infer<typeof formSchema>;

export function ProfileForm({ setDialogOpen }: ProfileFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      firstValue: undefined,
      employee: "",
      location: undefined,
    },
    mode: "onChange",
  });

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

  // Properly type the onError function
  function onError(errors: FieldErrors<FormData>) {
    console.log("Form errors:", errors);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-8">
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

const AddCoupon = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {/* <Dialog> */}
      <DialogTrigger asChild>
        <Button>Gutschein Erstellen</Button>
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
