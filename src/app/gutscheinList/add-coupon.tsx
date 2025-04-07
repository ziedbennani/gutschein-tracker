"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EMPLOYEE_NAMES } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  setCreatedCoupon: (coupon: Coupon | null) => void;
  setDialogOpen: (open: boolean) => void;
  useSimpleSchema?: boolean;
  setIsRedeemReady?: (ready: boolean) => void;
  couponType: string;
  defaultId?: string;
}

export function ProfileForm({
  setCreatedCoupon,
  setDialogOpen,
  useSimpleSchema = false,
  setIsRedeemReady,
  couponType,
  defaultId,
}: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [employeeSuggestions, setEmployeeSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pendingCoupons, setPendingCoupons] = useState<FormValues[]>([]);
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [savedLocation, setSavedLocation] = useState<
    "Braugasse" | "Transit" | "Pit Stop" | "Wirges" | "Büro"
  >();
  const [savedEmployee, setSavedEmployee] = useState<string | undefined>();

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
        employee: savedEmployee || "",
        location: savedLocation,
        couponType: "klein" as const,
      };
    } else {
      // Default values for normal value coupon (new)
      const defaults = {
        id: "",
        employee: savedEmployee || "",
        location: savedLocation,
        couponType: "value" as const,
      };
      // This cast is necessary to handle the optional/required field discrepancies
      return defaults as unknown as FormValues;
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(
      useSimpleSchema
        ? couponType === "klein"
          ? oldSmallCoupon
          : oldCoupon
        : couponType === "klein"
        ? newSmallCoupon
        : newCoupon
    ),
    defaultValues: {
      id: defaultId || "",
      createdAt: undefined as unknown as Date,
      couponType: couponType as "value" | "klein",
    },
  });

  // Add this function to filter suggestions
  const filterSuggestions = (input: string) => {
    if (!input) return [];
    return EMPLOYEE_NAMES.filter((name) =>
      name.toLowerCase().startsWith(input.toLowerCase())
    );
  };

  async function handleSubmit(formValues: z.infer<typeof formSchema>) {
    if (isMultiMode && !isConfirming) {
      // Save location and employee from first coupon
      if (pendingCoupons.length === 0 && !useSimpleSchema) {
        const newFormValues = formValues as {
          location: "Braugasse" | "Transit" | "Pit Stop" | "Wirges" | "Büro";
          employee: string;
        };
        setSavedLocation(newFormValues.location);
        setSavedEmployee(newFormValues.employee);
        console.log("savedLocation:", savedLocation);
        // Add to pending coupons with the current values
        setPendingCoupons([...pendingCoupons, formValues]);
      } else {
        // For subsequent coupons, add the saved location and employee
        const couponWithSavedValues = {
          ...formValues,
          location: savedLocation,
          employee: savedEmployee,
        };
        setPendingCoupons([...pendingCoupons, couponWithSavedValues]);
      }

      form.reset({
        ...getDefaultValues(),
        location: savedLocation,
        employee: savedEmployee,
      });
      setIsConfirming(false);
      toast({
        title: "Gutschein hinzugefügt",
        description: `Gutschein ${formValues.id} zur Liste hinzugefügt`,
        duration: 2000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Submit all pending coupons if in multi mode, otherwise just submit the current one
      const couponsToSubmit = isMultiMode
        ? [...pendingCoupons, formValues]
        : [formValues];

      for (const couponValues of couponsToSubmit) {
        if (useSimpleSchema) {
          setDialogOpen(false);
          setIsRedeemReady?.(true);
        }

        // Initialize request data with common fields
        const baseData: Omit<BaseRequestData, "couponType"> = {
          id: couponValues.id,
          oldSystem: useSimpleSchema,
          used: false,
          description: "", // Will be set below
        };

        // Initialize specific coupon type data
        let requestData: RequestData;
        if (couponValues.couponType === "klein") {
          requestData = {
            ...baseData,
            couponType: "klein",
            firstValue: 0,
            usedValue: 0,
            restValue: 0,
          };

          // For simple schema with klein coupon, include createdAt
          if (useSimpleSchema) {
            requestData.createdAt = (
              couponValues as z.infer<typeof oldSmallCoupon>
            ).createdAt;
          }
        } else {
          // Handle value coupon
          const valueToShow = useSimpleSchema
            ? (couponValues as z.infer<typeof oldCoupon>).restValue
            : (couponValues as z.infer<typeof newCoupon>).firstValue;

          requestData = {
            ...baseData,
            couponType: "value",
            restValue: valueToShow || 0,
            firstValue: useSimpleSchema ? undefined : valueToShow,
            usedValue: 0,
          };

          requestData.description = useSimpleSchema
            ? `ALT! ${couponValues.id} mit ${Number(valueToShow).toFixed(2)}€`
            : `NEU!`;
        }

        // Add employee and location for non-simple schema
        if (!useSimpleSchema) {
          requestData.employee = (
            couponValues as z.infer<typeof newCoupon>
          ).employee;
          requestData.location = (
            couponValues as z.infer<typeof newCoupon>
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
        if (!response.ok)
          throw new Error(`Failed to create coupon ${couponValues.id}`);

        // 3. Update local state first (synchronous operations)
        if (useSimpleSchema) {
          setCreatedCoupon?.(data.data.coupon);
        }
      }

      // Show success toast
      if (!useSimpleSchema) {
        toast({
          duration: 5000,
          title: isMultiMode ? "Gutscheine erstellt" : "Gutschein erstellt",
          variant: "success",
          description: (
            <span>
              {isMultiMode ? (
                `${
                  pendingCoupons.length + 1
                } Gutscheine wurden erfolgreich erstellt.`
              ) : (
                <>
                  Der Gutschein <strong>{formValues.id}</strong> wurde
                  erfolgreich erstellt.
                </>
              )}
            </span>
          ),
        });
        router.refresh();
      }

      // Clear pending coupons after successful submission
      setPendingCoupons([]);
    } catch (error) {
      console.error("Error creating coupons:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: isMultiMode
          ? "Die Gutscheine konnten nicht erstellt werden."
          : "Der Gutschein konnte nicht erstellt werden.",
      });
    } finally {
      setDialogOpen(false);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex gap-3">
      <div
        className={
          pendingCoupons.length > 0 && couponType !== "klein"
            ? "w-[360px]"
            : "w-max"
        }>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Tabs
              defaultValue="single"
              className="mb-2"
              onValueChange={(value) => {
                const newIsMultiMode = value === "multiple";
                // Only reset saved values if we're actually changing modes
                if (newIsMultiMode !== isMultiMode) {
                  setPendingCoupons([]);
                  setIsConfirming(false);
                  setSavedLocation(undefined);
                  setSavedEmployee(undefined);
                }
                setIsMultiMode(newIsMultiMode);
              }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Einzelner Gutschein</TabsTrigger>
                <TabsTrigger value="multiple">Mehrere Gutscheine</TabsTrigger>
              </TabsList>
            </Tabs>

            {useSimpleSchema && isMultiMode ? (
              <div className="flex items-center justify-center h-32 w-full bg-gray-50/50 rounded-lg text-lg font-medium text-gray-500">
                Coming soon, sorry not sorry...
              </div>
            ) : (
              <>
                <div
                  className={
                    useSimpleSchema
                      ? "grid grid-cols-2 gap-2"
                      : couponType === "klein"
                      ? pendingCoupons.length > 0
                        ? "flex gap-2"
                        : "grid grid-cols-[110px_160px_130px] gap-2"
                      : "grid grid-cols-2 gap-x-4 gap-y-2"
                  }>
                  {/* ID */}
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div
                          className={
                            isMultiMode &&
                            couponType === "klein" &&
                            pendingCoupons.length > 0
                              ? "flex pl-1 gap-4 items-baseline"
                              : "space-y-2"
                          }>
                          <FormLabel
                            className={cn(
                              fieldState.invalid && "text-red-500"
                            )}>
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
                        </div>
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
                                className={cn(
                                  fieldState.invalid && "text-red-500"
                                )}>
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
                                        e.target.value
                                          ? Number(e.target.value)
                                          : null
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
                                className={cn(
                                  fieldState.invalid && "text-red-500"
                                )}>
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
                                        e.target.value
                                          ? Number(e.target.value)
                                          : null
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
                  {!useSimpleSchema &&
                    (!isMultiMode || pendingCoupons.length === 0) && (
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel
                              className={cn(
                                fieldState.invalid && "text-red-500"
                              )}>
                              Laden
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Wo bist du Babe" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Braugasse">
                                  Braugasse
                                </SelectItem>
                                <SelectItem value="Transit">Transit</SelectItem>
                                <SelectItem value="Pit Stop">
                                  Pit Stop
                                </SelectItem>
                                <SelectItem value="Wirges">Wirges</SelectItem>
                                <SelectItem value="Büro">Büro</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    )}

                  {/* Mitarbeiter */}
                  {!useSimpleSchema &&
                    (!isMultiMode || pendingCoupons.length === 0) && (
                      <FormField
                        control={form.control}
                        name="employee"
                        render={({ field, fieldState }) => (
                          <FormItem className="relative">
                            <FormLabel
                              className={cn(
                                fieldState.invalid && "text-red-500"
                              )}>
                              Mitarbeiter
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Name"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const suggestions = filterSuggestions(
                                      e.target.value
                                    );
                                    setEmployeeSuggestions(suggestions);
                                    setShowSuggestions(true);
                                  }}
                                  onFocus={() => setShowSuggestions(true)}
                                  onBlur={() => {
                                    // Delay hiding suggestions to allow clicking on them
                                    setTimeout(
                                      () => setShowSuggestions(false),
                                      200
                                    );
                                  }}
                                />
                                {showSuggestions &&
                                  employeeSuggestions.length > 0 && (
                                    <div
                                      className="absolute z-[1000] w-full mt-1 bg-white border rounded-md shadow-lg overflow-y-auto"
                                      style={{ maxHeight: "160px" }}>
                                      {employeeSuggestions.map(
                                        (name, index) => (
                                          <div
                                            key={index}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                              field.onChange(name);
                                              setEmployeeSuggestions([]);
                                              setShowSuggestions(false);
                                            }}>
                                            {name}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
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
                              className={cn(
                                fieldState.invalid && "text-red-500"
                              )}>
                              Datum auf dem Gutschein
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(
                                  new Date(parseInt(value), 4, 15)
                                );
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
                    <div className="flex gap-2 w-full">
                      <Button
                        type="button"
                        onClick={async () => {
                          try {
                            // Only validate relevant fields based on the context
                            const fieldsToValidate =
                              isMultiMode && pendingCoupons.length > 0
                                ? ([
                                    "id",
                                    couponType === "value"
                                      ? "firstValue"
                                      : undefined,
                                  ].filter(Boolean) as (keyof FormValues)[])
                                : undefined;

                            const isValid = await form.trigger(
                              fieldsToValidate
                            );
                            if (isValid) {
                              const formValues = form.getValues();

                              // For subsequent coupons, include the saved values
                              const valuesToValidate =
                                isMultiMode && pendingCoupons.length > 0
                                  ? {
                                      ...formValues,
                                      location: savedLocation,
                                      employee: savedEmployee,
                                    }
                                  : formValues;

                              const parsedValues = await formSchema.parseAsync(
                                valuesToValidate
                              );

                              if (isMultiMode && !isConfirming) {
                                // Save location and employee from first coupon
                                if (
                                  pendingCoupons.length === 0 &&
                                  !useSimpleSchema
                                ) {
                                  const newFormValues = parsedValues as {
                                    location:
                                      | "Braugasse"
                                      | "Transit"
                                      | "Pit Stop"
                                      | "Wirges"
                                      | "Büro";
                                    employee: string;
                                  };
                                  setSavedLocation(newFormValues.location);
                                  setSavedEmployee(newFormValues.employee);
                                  // Add to pending coupons with the validated values
                                  setPendingCoupons([
                                    ...pendingCoupons,
                                    parsedValues,
                                  ]);
                                } else {
                                  // For subsequent coupons, add the validated values
                                  setPendingCoupons([
                                    ...pendingCoupons,
                                    parsedValues,
                                  ]);
                                }
                                form.reset({
                                  ...getDefaultValues(),
                                  location: savedLocation,
                                  employee: savedEmployee,
                                });
                              } else {
                                setIsConfirming(true);
                              }
                            }
                          } catch (error) {
                            console.error("Validation error:", error);
                            toast({
                              variant: "destructive",
                              title: "Validierungsfehler",
                              description: "Bitte überprüfe deine Eingaben.",
                            });
                          }
                        }}
                        className="bg-[#FDC30A] hover:bg-[#e3af09] text-black flex-1">
                        {isMultiMode
                          ? pendingCoupons.length > 0
                            ? "Weiteren hinzufügen"
                            : "Hinzufügen"
                          : "Erstellen"}
                      </Button>
                      {isMultiMode && pendingCoupons.length > 0 && (
                        <Button
                          type="button"
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsConfirming(true);
                          }}>
                          Alle erstellen ({pendingCoupons.length + 1})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-between w-full">
                      <div
                        className="items-center animate-[pulse_1s_ease-in-out_infinite]"
                        style={{
                          color: "#854d0e",
                          backgroundColor: "#fef9c3",
                          border: "1px solid #fde047",
                          padding: useSimpleSchema ? "5px" : "0 10px",
                          alignContent: "center",
                          borderRadius: "5px",
                          display: "inline-block",
                          width: "100%",
                          textAlign: "center",
                        }}>
                        <Label>
                          {isMultiMode
                            ? "BITTE NOCHMAL PRÜFEN"
                            : "BITTE NOCHMAL PRÜFEN"}
                        </Label>
                      </div>
                      <Button
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
              </>
            )}
          </form>
        </Form>
      </div>

      {isMultiMode && pendingCoupons.length > 0 && (
        <div className="flex-1 border-l pl-2">
          <div
            className={cn(
              "grid grid-rows-[repeat(5,auto)]  grid-flow-col gap-x-6",
              couponType !== "klein" ? "gap-y-1.5" : ""
            )}>
            {pendingCoupons.map((coupon, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-1 bg-gray-50/50 rounded-md">
                <span className="text-sm font-medium truncate">
                  {coupon.id} -{" "}
                  {couponType === "value"
                    ? `${
                        (coupon as z.infer<typeof oldCoupon>).restValue ||
                        (coupon as z.infer<typeof newCoupon>).firstValue
                      }€`
                    : "kl.Becher"}
                </span>
                <button
                  type="button"
                  className="ml-3 text-red-500 hover:text-red-700 text-lg leading-none shrink-0"
                  onClick={() => {
                    setPendingCoupons(
                      pendingCoupons.filter((_, i) => i !== index)
                    );
                  }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
          className="p-4 gap-2 mx-auto mt-2 top-0 translate-y-0 overflow-y-auto max-h-[90vh]"
          style={{
            width: "fit-content",
            // minWidth: "460px",
            // maxWidth: "550px",
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
            couponType={couponType}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCoupon;
