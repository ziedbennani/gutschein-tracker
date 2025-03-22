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
import { Icons } from "@/components/icons";
import { Label } from "@/components/ui/label";

// Define the Coupon interface
interface Coupon {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  employee: string;
  description: string;
  oldSystem: boolean;
  firstValue: number | null;
  usedValue: number | null;
  restValue: number;
  used: boolean;
  location: string | null;
  extraPayment: number | null;
  oldId: string | null;
  tip: number | null;
  couponType: string;
}

// Define request data types
interface BaseRequestData {
  id: string;
  oldSystem: boolean;
  used: boolean;
  description: string;
  employee?: string;
  location?: string;
  createdAt?: Date;
}

interface ValueCouponRequestData extends Omit<BaseRequestData, "couponType"> {
  couponType: "value";
  firstValue?: number;
  restValue: number;
  usedValue?: number;
}

interface KleinCouponRequestData extends Omit<BaseRequestData, "couponType"> {
  couponType: "klein";
  firstValue: number;
  usedValue: number;
  restValue: number;
}

type RequestData = ValueCouponRequestData | KleinCouponRequestData;

// Create the full schema for the original use case
const newCoupon = z.object({
  id: z
    .string()
    .min(1)
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
  location: z.enum(["Braugasse", "Transit", "Pit Stop", "Wirges", "Büro"]),
  employee: z.string().min(3),
  couponType: z.enum(["value", "klein"]),
});

// Create the simplified schema for your new use case
const oldCoupon = z.object({
  id: z
    .string()
    .min(1)
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
  restValue: z.number().optional(),
  couponType: z.enum(["value", "klein"]),
});

// Create schema for klein becher with full schema
const newSmallCoupon = z.object({
  id: z
    .string()
    .min(1)
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
  location: z.enum(["Braugasse", "Transit", "Pit Stop", "Wirges", "Büro"]),
  employee: z.string().min(3),
  couponType: z.enum(["value", "klein"]),
});

// Create schema for klein becher with simple schema
const oldSmallCoupon = z.object({
  id: z
    .string()
    .min(1)
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
  createdAt: z.date({
    required_error: "Bitte wähle ein Jahr aus",
    invalid_type_error: "Bitte wähle ein Jahr aus",
  }),
  couponType: z.enum(["value", "klein"]),
});

// Define FormValues type based on all possible form schemas
type FormValues =
  | z.infer<typeof oldCoupon>
  | z.infer<typeof oldSmallCoupon>
  | z.infer<typeof newSmallCoupon>
  | z.infer<typeof newCoupon>;

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
  const getDefaultValues = (): FormValues => {
    if (useSimpleSchema && couponType === "value") {
      return {
        id: "",
        restValue: undefined,
        couponType: "value" as const,
      };
    } else if (useSimpleSchema && couponType === "klein") {
      return {
        id: "",
        createdAt: undefined as unknown as Date,
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
      // Default values for normal value coupon (new)
      const defaults = {
        id: "",
        employee: "",
        location: undefined,
        couponType: "value" as const,
      };
      // This cast is necessary to handle the optional/required field discrepancies
      return defaults as unknown as FormValues;
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  async function handleSubmit(formValues: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      if (useSimpleSchema) {
        setDialogOpen(false);
        setIsRedeemReady?.(true);
      }

      // Initialize request data with common fields
      const baseData: Omit<BaseRequestData, "couponType"> = {
        id: formValues.id,
        oldSystem: useSimpleSchema,
        used: false,
        description: "", // Will be set below
      };

      // Initialize specific coupon type data
      let requestData: RequestData;
      if (formValues.couponType === "klein") {
        requestData = {
          ...baseData,
          couponType: "klein",
          firstValue: 0,
          usedValue: 0,
          restValue: 0,
        };

        // requestData.description = useSimpleSchema
        //   ? `ALT!  kl.Becher vom `${formValues.}` gespeichert`
        //   : `NEU! kl.Becher gespeichert`;

        // For simple schema with klein coupon, include createdAt
        if (useSimpleSchema) {
          requestData.createdAt = (
            formValues as z.infer<typeof oldSmallCoupon>
          ).createdAt;
        }
      } else {
        // Handle value coupon
        const valueToShow = useSimpleSchema
          ? (formValues as z.infer<typeof oldCoupon>).restValue
          : (formValues as z.infer<typeof newCoupon>).firstValue;

        requestData = {
          ...baseData,
          couponType: "value",
          restValue: valueToShow || 0,
          firstValue: useSimpleSchema ? undefined : valueToShow,
          usedValue: 0,
        };

        requestData.description = useSimpleSchema
          ? `ALT! ${formValues.id} mit ${Number(valueToShow).toFixed(2)}€`
          : `NEU!`;
      }

      // Add employee and location for non-simple schema
      if (!useSimpleSchema) {
        requestData.employee = (
          formValues as z.infer<typeof newCoupon>
        ).employee;
        requestData.location = (
          formValues as z.infer<typeof newCoupon>
        ).location;
      }

      // Make the API call
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
      }
      // else {
      //   setIsRedeemReady?.(false);
      // }

      // 5. Show success toast
      if (!useSimpleSchema) {
        toast({
          duration: 5000,
          title: "Gutschein erstellt",
          variant: "success",
          description: (
            <span>
              Der Gutschein <strong>{formValues.id}</strong> wurde erfolgreich
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
      setDialogOpen(false);
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
                    <Input
                      placeholder="Nummer"
                      {...field}
                      onBlur={(e) => {
                        field.onBlur();
                        if (field.value) {
                          form.trigger("id");
                          console.log(e);
                        }
                      }}
                    />
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
                          Betrag auf dem Gutschein
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
                          <SelectValue placeholder="Laden auswählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Braugasse">Braugasse</SelectItem>
                        <SelectItem value="Transit">Transit</SelectItem>
                        <SelectItem value="Pit Stop">Pit Stop</SelectItem>
                        <SelectItem value="Wirges">Wirges</SelectItem>
                        <SelectItem value="Büro">Büro</SelectItem>
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
                render={({ field, fieldState }) => {
                  const currentYear = new Date().getFullYear();
                  // Don't provide a default value to show placeholder
                  const yearValue =
                    field.value instanceof Date
                      ? field.value.getFullYear().toString()
                      : "";

                  // Generate array of years from 2000 to current year
                  const years = Array.from(
                    { length: currentYear - 1999 },
                    (_, i) => (2000 + i).toString()
                  ).reverse(); // Reverse to show newest years first

                  return (
                    <FormItem>
                      <FormLabel
                        className={cn(fieldState.invalid && "text-red-500")}>
                        Datum auf dem Gutschein
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(new Date(parseInt(value), 4, 15));
                        }}
                        value={yearValue}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Jahr auswählen" />
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
                  // const isValid = await form.trigger();
                  // if (isValid) {
                  setIsConfirming(true);
                  // }
                }}>
                Erstellen
              </Button>
            ) : (
              <div className="flex gap-2 justify-between w-full">
                <div
                  className="items-center animate-[pulse_0.7s_ease-in-out_infinite]"
                  style={{
                    color: "#842029" /* Dark amber text */,
                    backgroundColor: "#f8d7da" /* Light red background */,
                    border: "1px solid #f5c2c7" /* Soft red border */,
                    padding: useSimpleSchema ? "5px" : "0 10px",
                    alignContent: "center",
                    borderRadius: "5px",
                    display: "inline-block",
                    width: "100%",
                    textAlign: "center",
                  }}>
                  <Label>BITTE NOCHMAL SCHAUEN.. ALLES KORREKT ?</Label>
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
          <Button>Gutschein Verkaufen</Button>
        </DialogTrigger>
        <DialogContent className="p-5 gap-5 max-w-[95vw] w-[496px] mx-auto mt-2 top-0 translate-y-0 overflow-y-auto max-h-[90vh] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-fit">
          <DialogHeader>
            <DialogTitle>Gutschein-Typ wählen</DialogTitle>
            <Separator className="my-3" />
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleValueCouponSelect}
              className="h-12 w-full flex flex-col bg-gradient-to-r from-[#FDC30A] to-[#FFD700] text-[#333333] font-semibold">
              Normal
            </Button>
            <Button
              onClick={handleKleinBecherSelect}
              className="h-12 w-full flex flex-col bg-gradient-to-r from-[#FFD700] to-[#FDC30A] text-[#333333] font-semibold ">
              Klein Becher
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          className="p-4 gap-4 max-w-[95vw] mx-auto mt-2 top-0 translate-y-0 overflow-y-auto max-h-[90vh] sm:max-w-[90vw] md:max-w-[85vw]"
          style={{
            width: "fit-content",
            minWidth: "460px",
            maxWidth: "550px",
            transition: "width 0.3s ease",
          }}
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
