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
  FormMessage,
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
import { Icons } from "@/components/icons";
import { Label } from "@/components/ui/label";
// import { formatCurrency } from "./utils";

// Create the full schema for the original use case
const newCoupon = z.object({
  id: z
    .string()
    .min(2)
    .transform((val) => val.toUpperCase())
    .refine(
      async (id) => {
        const response = await fetch(`/api/coupons/check-id?id=${id}`);
        const { exists } = await response.json();
        return !exists;
      },
      {
        message: "Nummer schon gegeben",
      }
    ),
  firstValue: z.number().min(1),
  location: z.enum(["Braugasse", "Transit", "Pit Stop", "Wirges"]),
  employee: z.string().min(3),
  couponType: z.enum(["value", "klein"]),
});

// Create the simplified schema for your new use case
const oldCoupon = z.object({
  id: z
    .string()
    .min(2)
    .transform((val) => val.toUpperCase())
    .refine(
      async (id) => {
        const response = await fetch(`/api/coupons/check-id?id=${id}`);
        const { exists } = await response.json();
        return !exists;
      },
      {
        message: "Nummer schon gegeben",
      }
    ),
  restValue: z.number().min(1),
  couponType: z.enum(["value", "klein"]),
});

// Create schema for klein becher with full schema
const newSmallCoupon = z.object({
  id: z
    .string()
    .min(2)
    .transform((val) => val.toUpperCase())
    .refine(
      async (id) => {
        const response = await fetch(`/api/coupons/check-id?id=${id}`);
        const { exists } = await response.json();
        return !exists;
      },
      {
        message: "Nummer schon gegeben",
      }
    ),
  location: z.enum(["Braugasse", "Transit", "Pit Stop", "Wirges"]),
  employee: z.string().min(3),
  couponType: z.enum(["value", "klein"]),
});

// Create schema for klein becher with simple schema
const oldSmallCoupon = z.object({
  id: z
    .string()
    .min(2)
    .transform((val) => val.toUpperCase())
    .refine(
      async (id) => {
        const response = await fetch(`/api/coupons/check-id?id=${id}`);
        const { exists } = await response.json();
        return !exists;
      },
      {
        message: "Nummer schon gegeben",
      }
    ),
  createdAt: z.date(),
  couponType: z.enum(["value", "klein"]),
});

// Define a type for the form values based on the schema
type FormValues =
  | z.infer<typeof newCoupon>
  | z.infer<typeof oldCoupon>
  | z.infer<typeof newSmallCoupon>
  | z.infer<typeof oldSmallCoupon>;

interface ProfileFormProps {
  setCreatedCoupon?: (coupon: Coupon | null) => void;
  setDialogOpen: (open: boolean) => void;
  useSimpleSchema?: boolean;
  setIsRedeemReady?: (ready: boolean) => void;
  createdCoupon?: Coupon | null;
  couponType?: string;
}

export function ProfileForm({
  setCreatedCoupon,
  setDialogOpen,
  useSimpleSchema = false,
  setIsRedeemReady,
  couponType,
}: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Select the appropriate schema based on useSimpleSchema and couponType
  const formSchema = useSimpleSchema
    ? couponType === "klein"
      ? oldSmallCoupon
      : oldCoupon
    : couponType === "klein"
    ? newSmallCoupon
    : newCoupon;

  const router = useRouter();

  // Create default values based on the schema type
  const getDefaultValues = () => {
    if (useSimpleSchema && couponType === "value") {
      return {
        id: "",
        restValue: undefined,
        couponType: "value" as const,
      };
    } else if (useSimpleSchema && couponType === "klein") {
      return {
        id: "",
        createdAt: new Date(),
        couponType: "klein" as const,
      };
    } else if (!useSimpleSchema && couponType === "klein") {
      return {
        id: "",
        employee: "",
        location: undefined,
        couponType: "klein" as const,
      };
    } else {
      return {
        id: "",
        firstValue: undefined,
        employee: "",
        location: undefined,
        couponType: "value" as const,
      };
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues() as any,
    mode: "onSubmit",
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      if (useSimpleSchema) {
        setDialogOpen(false);
        setIsRedeemReady?.(true);
      }

      // Prepare request data based on schema type
      const requestData: Record<string, any> = {
        ...values,
        oldSystem: useSimpleSchema,
        used: false,
        couponType: values.couponType,
        // Ensure employee is set (required by the database)
      };

      // Set description based on coupon type
      if (values.couponType === "klein") {
        requestData.description = useSimpleSchema
          ? `ALT! ${values.id} (Kl. Becher) gespeichert`
          : `NEU! ${values.id} (Kl. Becher) gespeichert`;

        // For klein coupons, set numeric values to 0
        requestData.firstValue = 0;
        requestData.usedValue = 0;
        requestData.restValue = 0;
      } else {
        const valueToShow = useSimpleSchema
          ? (values as z.infer<typeof oldCoupon>).restValue
          : (values as z.infer<typeof newCoupon>).firstValue;
        requestData.description = useSimpleSchema
          ? `ALT! ${values.id} mit ${Number(valueToShow).toFixed(2)}€`
          : `NEU! ${values.id} mit ${Number(valueToShow).toFixed(2)} €`;
      }

      // Handle restValue based on coupon type and schema
      if (couponType === "klein") {
        // Klein Becher has no monetary value, but we set it to 0 for database requirements
        requestData.restValue = 0;

        // For simple schema with klein coupon, include createdAt
        if (useSimpleSchema) {
          requestData.createdAt = (
            values as z.infer<typeof oldSmallCoupon>
          ).createdAt;
        }
      } else if (useSimpleSchema) {
        // For simple schema with value coupon, use restValue directly
        requestData.restValue = (values as z.infer<typeof oldCoupon>).restValue;
      } else {
        // For full schema with value coupon, set restValue to firstValue
        requestData.restValue =
          (values as z.infer<typeof newCoupon>).firstValue || undefined;
      }

      // 2. Make the main API call
      const response = await fetch(
        useSimpleSchema ? "/api/coupons/old-coupon" : "/api/coupons",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error("Failed to create coupon");

      // 3. Update local state first (synchronous operations)
      if (useSimpleSchema) {
        setCreatedCoupon?.(data.data.coupon);
      } else {
        setIsRedeemReady?.(false);
      }

      // 4. Close the dialog (UI update)
      setDialogOpen(false);

      // 5. Show success toast
      if (!useSimpleSchema) {
        toast({
          duration: 5000,
          title: "Gutschein erstellt",
          variant: "success",
          description: (
            <span>
              Der Gutschein <strong>{values.id}</strong> wurde erfolgreich
              erstellt.
            </span>
          ),
        });
        router.refresh();
      }

      // 6. Finally, refresh the router
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Der Gutschein konnte nicht erstellt werden.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div
            className={
              useSimpleSchema
                ? "grid grid-cols-2 gap-2"
                : couponType === "klein"
                ? "grid grid-cols-3 gap-2"
                : "grid grid-cols-2 gap-x-4 gap-y-2"
            }>
            {/* ID */}
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
                    <Input placeholder="Nummer" {...field} />
                  </FormControl>
                  <FormMessage className="text-sm w-max" />
                </FormItem>
              )}
            />

            {/* Betrag */}
            {couponType === "value" && (
              <>
                {useSimpleSchema ? (
                  <FormField
                    control={form.control}
                    name="restValue"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel
                          className={cn(fieldState.invalid && "text-red-500")}>
                          Aktueller Betrag
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Betrag"
                              type="number"
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                              €
                            </span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ) : (
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
                              placeholder="Betrag"
                              type="number"
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                              €
                            </span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            {/* Laden */}
            {!useSimpleSchema && (
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
                          <SelectValue placeholder="Where are u baby" />
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
            )}

            {/* Mitarbeiter */}
            {!useSimpleSchema && (
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
            )}

            {/* Created Date - only for klein coupon type with simple schema */}
            {useSimpleSchema && couponType === "klein" && (
              <FormField
                control={form.control}
                name="createdAt"
                render={({ field }) => {
                  const currentYear = new Date().getFullYear();
                  const yearValue =
                    field.value instanceof Date
                      ? field.value.getFullYear().toString()
                      : currentYear.toString();

                  // Generate array of years from 2000 to current year
                  const years = Array.from(
                    { length: currentYear - 1999 },
                    (_, i) => (2000 + i).toString()
                  ).reverse(); // Reverse to show newest years first

                  return (
                    <FormItem>
                      <FormLabel>Gutschein von der Saison</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(new Date(parseInt(value), 4, 15));
                        }}
                        value={yearValue}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wähle ein Jahr" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}
          </div>
          <div className="flex justify-end mt-4">
            {!isConfirming ? (
              <Button
                // style={{ width: "139.25px" }}
                type="button"
                className="bg-[#FDC30A] hover:bg-[#e3af09] text-black"
                onClick={async (e) => {
                  e.preventDefault();
                  // Trigger validation on all fields
                  const isValid = await form.trigger();
                  if (isValid) {
                    setIsConfirming(true);
                  }
                }}>
                Erstellen
              </Button>
            ) : (
              <div className="flex gap-2 justify-between w-full">
                <div
                  className="items-center"
                  style={{
                    color: "#856404" /* Dark amber text */,
                    backgroundColor: "#fff3cd" /* Light yellow background */,
                    border: "1px solid #ffeeba" /* Soft yellow border */,
                    padding: "5px",
                    borderRadius: "5px",
                    display: "inline-block",
                    width: "100%",
                    textAlign: "center",
                  }}>
                  <Label>Bitte nochmal überprüfen !! ALLES korrekt ?</Label>
                </div>
                <Button
                  // style={{ width: "139.25px" }}
                  className="bg-[#FDC30A] hover:bg-[#e3af09] text-black contrast-125"
                  type="submit"
                  disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                      Warte oh
                    </>
                  ) : (
                    "Bestätigen"
                  )}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </>
  );
}

const AddCoupon = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createdCoupon, setCreatedCoupon] = useState<Coupon | null>(null);
  const [couponType, setCouponType] = useState<string>("");
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);

  const handleValueCouponSelect = () => {
    setCouponType("value");
    setTypeDialogOpen(false);
    setDialogOpen(true);
  };

  const handleKleinBecherSelect = () => {
    setCouponType("klein");
    setTypeDialogOpen(false);
    setDialogOpen(true);
  };

  return (
    <>
      <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
        <DialogTrigger asChild>
          <Button>Neuer Gutschein</Button>
        </DialogTrigger>
        <DialogContent className="p-5 gap-5 max-w-[95vw] w-[496px] mx-auto mt-2 top-0 translate-y-0 overflow-y-auto max-h-[90vh] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-fit">
          <DialogHeader>
            <DialogTitle>Gutschein-Typ wählen</DialogTitle>
            <Separator className="my-3" />
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleValueCouponSelect}
              className="h-12 w-full flex flex-col bg-gradient-to-r from-[#FDC30A] to-[#FFD700] text-[#333333] font-semibold border-[#E0B000] border">
              Normal
            </Button>
            <Button
              onClick={handleKleinBecherSelect}
              className="h-12 w-full flex flex-col bg-gradient-to-r from-[#FFD700] to-[#FDC30A] text-[#333333] font-semibold border-[#E0B000] border">
              Klein Becher
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          className="p-4 gap-4 max-w-[95vw] w-full mx-auto mt-2 top-0 translate-y-0 overflow-y-auto max-h-[90vh] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-fit"
          aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {couponType === "value"
                ? "Normaler Gutschein erstellen"
                : "Klein Becher Gutschein erstellen"}
            </DialogTitle>
            <Separator className="my-4" />
          </DialogHeader>

          <ProfileForm
            setDialogOpen={setDialogOpen}
            setCreatedCoupon={setCreatedCoupon}
            createdCoupon={createdCoupon}
            couponType={couponType}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCoupon;
