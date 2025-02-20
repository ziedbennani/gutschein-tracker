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
import { cn } from "@/lib/utils";
import { toast, useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  id: z
    .string()
    .min(2)
    .transform((val) => val.toUpperCase()),
  firstValue: z.number().min(1),
  employee: z.string().min(3),
  location: z.enum(["Braugasse", "Transit", "Pit Stop", "Wirges"]),
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
    mode: "onSubmit",
  });

  // Modified submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // First check if ID exists
      const checkResponse = await fetch(
        `/api/coupons/check-id?id=${values.id}`
      );
      const { exists } = await checkResponse.json();

      if (exists) {
        form.setError("id", {
          type: "manual",
          message: "Gutschein Nummer schon benutzt ",
        });
        return;
      }

      // If ID doesn't exist, proceed with creating the coupon
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
      toast({
        duration: 3000,
        title: "Gutschein erstellt",
        description: (
          <span>
            Der Gutschein <strong>{values.id}</strong> wurde erfolgreich
            erstellt.
          </span>
        ),
      });
    } catch (error) {
      console.error("Error creating coupon:", error);
    } finally {
      setDialogOpen(false);
      router.refresh();
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
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel
                    className={cn(fieldState.invalid && "text-red-500")}>
                    Nummer
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="EF1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstValue"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel
                    className={cn(fieldState.invalid && "text-red-500")}>
                    Betrag
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="10,00"
                        type="number"
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        €
                      </span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Right Column */}

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="employee"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel
                    className={cn(fieldState.invalid && "text-red-500")}>
                    Mitarbeiter
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel
                    className={cn(fieldState.invalid && "text-red-500")}>
                    Laden
                  </FormLabel>
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
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button className="flex justify-self-end" type="submit">
          Bestätigen
        </Button>
      </form>
    </Form>
  );
}

const AddCoupon = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>Gutschein Erstellen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neu Gutschein</DialogTitle>
          <Separator className="my-4" />
        </DialogHeader>
        <ProfileForm setDialogOpen={setDialogOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default AddCoupon;
