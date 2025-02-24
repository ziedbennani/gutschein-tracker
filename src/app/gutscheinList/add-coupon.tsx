"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
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
import { toast } from "@/hooks/use-toast";
import { Coupon } from "./columns";
// import { formatCurrency } from "./utils";

// Create a base schema with common fields
const baseFormSchema = {
  id: z
    .string()
    .min(2)
    .transform((val) => val.toUpperCase()),
  employee: z.string().min(3),
};

// Create the full schema for the original use case
const fullFormSchema = z.object({
  ...baseFormSchema,
  firstValue: z.number().min(1),
  location: z.enum(["Braugasse", "Transit", "Pit Stop", "Wirges"]),
});

// Create the simplified schema for your new use case
const simpleFormSchema = z.object({
  ...baseFormSchema,
  restValue: z.number().min(1),
});

// Update the props interface to include schema configuration
type FormValues =
  | z.infer<typeof fullFormSchema>
  | z.infer<typeof simpleFormSchema>;

interface ProfileFormProps {
  setCreatedCoupon?: (coupon: Coupon | null) => void;
  setDialogOpen: (open: boolean) => void;
  useSimpleSchema?: boolean;
  onSubmit?: (values: FormValues) => Promise<void>;
  setIsRedeemReady?: (ready: boolean) => void;
  createdCoupon?: Coupon | null;
}

export function ProfileForm({
  setCreatedCoupon,
  createdCoupon,
  setDialogOpen,
  useSimpleSchema = false,
  onSubmit,
  setIsRedeemReady,
}: ProfileFormProps) {
  const formSchema = useSimpleSchema ? simpleFormSchema : fullFormSchema;
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: useSimpleSchema
      ? {
          id: "",
          employee: "",
          restValue: undefined,
        }
      : {
          id: "",
          firstValue: undefined,
          employee: "",
          location: undefined,
        },
    mode: "onSubmit",
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    if (onSubmit) {
      await onSubmit(values);
      return;
    }
    if (useSimpleSchema) {
      setDialogOpen(false);
      setIsRedeemReady?.(true);
    }

    try {
      // 1. First, validate data (check if ID exists)
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

      // 2. Make the main API call
      const response = await fetch(
        useSimpleSchema ? "/api/coupons/old-coupon" : "/api/coupons",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            oldSystem: useSimpleSchema,
            description: "",
            used: false,
            restValue: useSimpleSchema
              ? (values as z.infer<typeof simpleFormSchema>).restValue
              : (values as z.infer<typeof fullFormSchema>).firstValue || 0,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error("Failed to create coupon");

      // 3. Update UI state
      setDialogOpen(false);

      // 5. Update local state and data
      if (useSimpleSchema) {
        setCreatedCoupon?.(data.data.coupon);
      } else {
        setIsRedeemReady?.(false);
      }

      // 6. Finally, refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Der Gutschein konnte nicht erstellt werden.",
      });
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div
            className={
              useSimpleSchema
                ? "grid grid-cols-3 gap-2"
                : "grid grid-cols-2 gap-x-4 gap-y-2"
            }>
            {/* ID field always first */}
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
                </FormItem>
              )}
            />

            {/* Conditionally render either restValue or the full form fields */}
            {useSimpleSchema ? (
              <>
                {/* restValue field second */}
                <FormField
                  control={form.control}
                  name="restValue"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel
                        className={cn(fieldState.invalid && "text-red-500")}>
                        Betrag
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="0,00"
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
                {/* employee field third */}
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
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit">Bestätigen</Button>
          </div>
        </form>
      </Form>
    </>
  );
}

const AddCoupon = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createdCoupon, setCreatedCoupon] = useState<Coupon | null>(null);

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>Gutschein Erstellen</Button>
        </DialogTrigger>
        <DialogContent
          className="p-4 gap-4 max-w-fit "
          aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Neu Gutschein</DialogTitle>
            <Separator className="my-4" />
          </DialogHeader>

          <ProfileForm
            setDialogOpen={setDialogOpen}
            setCreatedCoupon={setCreatedCoupon}
            createdCoupon={createdCoupon}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCoupon;
