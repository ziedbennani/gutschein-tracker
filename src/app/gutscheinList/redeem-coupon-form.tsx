"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMPLOYEE_NAMES } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Coupon } from "./columns";
import { cn } from "@/lib/utils";
import { useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { formatCurrency } from "./utils";

const formSchema = z
  .object({
    usedValue: z.number(),
    employee: z.string().min(3),
    location: z.enum([
      "Braugasse",
      "Transit",
      "Pit Stop",
      "Wirges",
      "Büro",
      "Eiswagen",
    ]),
    tip: z.number().nullable().optional(),
    newId: z
      .string()
      .optional()
      .transform((val) => val?.toUpperCase()),
  })
  .refine((data) => {
    console.log("data", data);
    return true;
  });

interface RedeemFormProps {
  coupon: Coupon;
  setDialogOpen: (open: boolean) => void;
  onCouponRedeemed?: (couponId: string) => void;
  setIsRedeemReady?: (ready: boolean) => void;
  setCreatedCoupon?: (coupon: Coupon | null) => void;
  couponType: string;
  defaultLocation?:
    | "Braugasse"
    | "Transit"
    | "Pit Stop"
    | "Wirges"
    | "Büro"
    | "Eiswagen";
}

interface FieldType {
  value: number | null | undefined;
}

export function RedeemForm({
  coupon,
  setDialogOpen,
  onCouponRedeemed,
  setIsRedeemReady,
  setCreatedCoupon,
  defaultLocation,
}: RedeemFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isFormSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [employeeSuggestions, setEmployeeSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
      coupon.couponType === "value"
        ? {
            usedValue: undefined,
            employee: "",
            location: defaultLocation,
            tip: undefined,
            newId: "",
          }
        : {
            // For klein coupons
            usedValue: 2.4,
            employee: "",
            location: defaultLocation,
          },
    mode: "onSubmit",
  });

  const filterSuggestions = (input: string) => {
    if (!input) return [];
    return EMPLOYEE_NAMES.filter((name) =>
      name.toLowerCase().startsWith(input.toLowerCase())
    );
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (values.newId) {
        const checkResponse = await fetch(
          `/api/coupons/check-id?id=${values.newId}`
        );
        const { exists } = await checkResponse.json();

        if (exists) {
          form.setError("newId", {
            type: "manual",
            message: "Schon gegeben ",
          });
          return;
        }
      }

      // Prepare the data for API call
      const requestData = {
        ...values,
        // For klein coupons, ensure numeric values are set
        // usedValue: coupon.couponType === "klein" ? 0 : values.usedValue,
        // restValue: coupon.couponType === "klein" ? 0 : undefined,
      };

      // 1. First, make the API call
      const response = await fetch(`/api/coupons/${coupon.id}/redeem`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to redeem coupon");
      }

      // 2. Update UI state (close dialogs, reset forms)
      setIsRedeemReady?.(false);
      setCreatedCoupon?.(null);

      // 3. Show success feedback
      toast({
        duration: 5000,
        title: "Gutschein eingelöst",
        variant: "success",
        description: (
          <span>
            Der Gutschein <strong>{values.newId || coupon.id}</strong> wurde
            erfolgreich eingelöst.
          </span>
        ),
      });

      // 4. Update data and trigger rerenders
      onCouponRedeemed?.(values.newId || coupon.id);

      // 5. Finally, refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Error redeeming coupon:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Der Gutschein konnte nicht eingelöst werden.",
      });
    } finally {
      setDialogOpen(false);
      setIsLoading(false);
    }
  }

  const remainingAmount = (field: FieldType) => {
    const tipValue = form.watch("tip") || 0;

    if (
      field.value === undefined ||
      field.value === null ||
      field.value === 0
    ) {
      return formatCurrency(coupon.restValue - tipValue);
    }
    const remaining = coupon.restValue - field.value - tipValue;
    return formatCurrency(Math.abs(remaining));
  };

  const isPositiveBalance = (field: FieldType) => {
    if (
      field.value === undefined ||
      field.value === null ||
      field.value === 0
    ) {
      return true;
    }
    return coupon.restValue - field.value >= 0;
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div
            className={cn(coupon.couponType === "value" ? "flex gap-4" : "")}>
            {/* Left Column */}
            <div className="flex-1 flex flex-col">
              {coupon.couponType === "value" && (
                <FormField
                  control={form.control}
                  name="usedValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Einzulösender Betrag</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Betrag"
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

                      <div className="mt-4">
                        <FormLabel>
                          {field.value === undefined ||
                          field.value === null ||
                          field.value === 0 ? (
                            "Restbetrag"
                          ) : isPositiveBalance(field) ? (
                            "Restbetrag"
                          ) : (
                            <span className="text-red-500 uppercase animate-[pulse_0.7s_ease-in-out_infinite] inline-block">
                              Zuzahlung
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              value={remainingAmount(field)}
                              disabled
                              className="mt-2 [&:disabled]:opacity-100 [&:disabled]:text-black [&:disabled]:cursor-default"
                            />
                          </div>
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {coupon.couponType !== "klein" && (
                <FormField
                  control={form.control}
                  name="tip"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col mt-4">
                      <FormLabel
                        className={cn(fieldState.invalid && "text-red-500")}>
                        Trinkgeld
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Trinkgeld"
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
              )}
            </div>

            {/* Right Column */}
            <div
              className={cn(
                "flex-1 flex ",
                coupon.couponType === "klein" ? " flex-col gap-4" : "flex-col"
              )}>
              <div
                className={cn(
                  coupon.couponType === "klein" ? "grid grid-cols-2	 gap-4" : ""
                )}>
                <FormField
                  control={form.control}
                  name="employee"
                  render={({ field, fieldState }) => (
                    <FormItem className="relative flex-1">
                      <FormLabel
                        className={cn(fieldState.invalid && "text-red-500 ")}>
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
                              setTimeout(() => setShowSuggestions(false), 200);
                            }}
                          />
                          {showSuggestions &&
                            employeeSuggestions.length > 0 && (
                              <div
                                className={cn(
                                  "absolute z-[99999] bg-white border rounded-md shadow-lg overflow-y-auto mt-1",
                                  coupon.couponType === "klein"
                                    ? "w-[210px]"
                                    : "w-[235px]"
                                )}
                                style={{
                                  maxHeight: "160px",
                                }}>
                                {employeeSuggestions.map((name, index) => (
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
                                ))}
                              </div>
                            )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field, fieldState }) => (
                    <FormItem
                      className={cn(
                        coupon.couponType === "value" ? "mt-2" : "flex-1"
                      )}>
                      <FormLabel
                        className={cn(fieldState.invalid && "text-red-500 ")}>
                        Wo bist du Babe ?
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={defaultLocation}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wo bist du Babe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Braugasse">Braugasse</SelectItem>
                          <SelectItem value="Transit">Transit</SelectItem>
                          <SelectItem value="Pit Stop">Pit Stop</SelectItem>
                          <SelectItem value="Wirges">Wirges</SelectItem>
                          <SelectItem value="Büro">Büro</SelectItem>
                          <SelectItem value="Eiswagen">Eiswagen</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex mt-auto gap-2 justify-end">
                {coupon.couponType === "value" && (
                  <div>
                    {isFormSubmitted ? (
                      <FormField
                        control={form.control}
                        name="newId"
                        render={({ field, fieldState }) => (
                          <FormItem className="flex flex-col mt-4">
                            <FormLabel
                              className={cn(
                                fieldState.invalid && "text-red-500"
                              )}>
                              Neue Nummer
                            </FormLabel>
                            <FormControl>
                              <Input
                                style={{ width: "139.25px" }}
                                placeholder="Nummer"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <Button
                        className="mt-[2.35rem]"
                        variant="default"
                        type="button"
                        onClick={() => {
                          setFormSubmitted(true);
                        }}>
                        Gutschein Voll ?
                      </Button>
                    )}
                  </div>
                )}

                {!isConfirming ? (
                  <Button
                    type="button"
                    className={cn(
                      " bg-[#FDC30A] hover:bg-[#e3af09] text-black w-full",
                      coupon.couponType === "value" && "mt-[2.35rem]"
                    )}
                    onClick={async (e) => {
                      e.preventDefault();

                      // For klein coupons, set usedValue to 0 if not provided
                      if (coupon.couponType === "klein") {
                        form.setValue("usedValue", 2.4);
                      }

                      // Trigger validation on all fields
                      const isValid = await form.trigger();

                      if (isValid) {
                        setIsConfirming(true);
                      }
                    }}>
                    Einlösen
                  </Button>
                ) : (
                  <div className="flex gap-2 justify-between w-full">
                    {coupon.couponType === "klein" && (
                      <div
                        className="flex flex-col items-center animate-[pulse_1s_ease-in-out_infinite]"
                        style={{
                          color: "#854d0e",
                          backgroundColor: "#fef9c3",
                          border: "1px solid #fde047",
                          padding: "5px",
                          alignContent: "center",
                          borderRadius: "5px",
                          display: "inline-block",
                          width: "100%",
                          textAlign: "center",
                        }}>
                        <Label>BITTE NOCHMAL PRÜFEN</Label>
                      </div>
                    )}
                    <Button
                      className={cn(
                        " bg-[#FDC30A] hover:bg-[#e3af09] text-black contrast-125",
                        coupon.couponType === "value" && "mb-2 mt-[2.35rem]"
                      )}
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
            </div>
          </div>
        </form>
        {isConfirming && coupon.couponType === "value" && (
          <div
            className="flex flex-col items-center mt-1 animate-[pulse_1s_ease-in-out_infinite]"
            style={{
              color: "#854d0e",
              backgroundColor: "#fef9c3",
              border: "1px solid #fde047",
              padding: "5px",
              alignContent: "center",
              borderRadius: "5px",
              display: "inline-block",
              width: "100%",
              textAlign: "center",
            }}>
            <Label>BITTE NOCHMAL PRÜFEN</Label>
          </div>
        )}
      </Form>
    </>
  );
}
