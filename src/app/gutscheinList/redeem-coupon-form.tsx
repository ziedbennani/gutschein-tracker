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
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Coupon } from "./columns";
import { cn } from "@/lib/utils";
import { useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";

const formSchema = z.object({
  usedValue: z.number().min(0.9, "Betrag muss größer als 0,90 € sein"),
  employee: z.string().min(3),
  location: z.enum(["Braugasse", "Transit", "Pit Stop", "Wirges"]),
  tip: z.number().default(0).optional(),
  newId: z
    .string()
    .optional()
    .transform((val) => val?.toUpperCase()),
});

interface RedeemFormProps {
  coupon: Coupon;
  setDialogOpen: (open: boolean) => void;
  onCouponRedeemed?: (couponId: string) => void;
  setIsRedeemReady?: (ready: boolean) => void;
  setCreatedCoupon?: (coupon: Coupon | null) => void;
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
}: RedeemFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isFormSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usedValue: undefined,
      employee: "",
      location: undefined,
      tip: undefined,
      newId: "",
    },
    mode: "onSubmit",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // 1. First, make the API call
      const response = await fetch(`/api/coupons/${coupon.id}/redeem`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to redeem coupon");
      }

      // 2. Update UI state (close dialogs, reset forms)
      setDialogOpen(false);
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
      setIsLoading(false);
    }
  }

  const remainingAmount = (field: FieldType) => {
    if (
      field.value === undefined ||
      field.value === null ||
      field.value === 0
    ) {
      return coupon.restValue.toFixed(2);
    }
    const remaining = coupon.restValue - field.value;
    return Math.abs(remaining).toFixed(2);
  };

  const isPositiveBalance = (field: FieldType) => {
    if (
      field.value === undefined ||
      field.value === null ||
      field.value === 0
    ) {
      return true;
    }
    return coupon.restValue - field.value > 0;
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex gap-6">
            {/* Left Column */}
            <div className="flex-1 flex flex-col">
              <FormField
                control={form.control}
                name="usedValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Einzulösender Betrag</FormLabel>
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

                    <div className="mt-4">
                      <FormLabel>
                        {field.value === undefined ||
                        field.value === null ||
                        field.value === 0
                          ? "Restbetrag"
                          : isPositiveBalance(field)
                          ? "Restbetrag"
                          : "Zuzahlung"}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            value={remainingAmount(field)}
                            disabled
                            className="mt-2 [&:disabled]:opacity-100 [&:disabled]:text-black [&:disabled]:cursor-default"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            €
                          </span>
                        </div>
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
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
                          // style={{ width: "139.25px" }}
                          placeholder="0,00"
                          {...field}
                          value={field.value ?? ""}
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
            <div className="flex-1 flex flex-col">
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

              <div className="mt-2">
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
              <div className="flex mt-auto gap-2 items-end">
                {isFormSubmitted ? (
                  <FormField
                    control={form.control}
                    name="newId"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel
                          className={cn(fieldState.invalid && "text-red-500")}>
                          Neue Nummer
                        </FormLabel>
                        <FormControl>
                          <Input
                            style={{ width: "139.25px" }}
                            placeholder="EF1234"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ) : (
                  <Button
                    // style={{ width: "139.25px" }}
                    variant="default"
                    type="button"
                    onClick={() => {
                      setFormSubmitted(true);
                    }}>
                    Gutschein Voll ?
                  </Button>
                )}

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
                    Bestätigen
                  </Button>
                ) : (
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
                      "Einlösen"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
        {isConfirming && (
          <div
            className="flex flex-col items-center mt-4"
            style={{
              color: "#856404" /* Dark amber text */,
              backgroundColor: "#fff3cd" /* Light yellow background */,
              border: "1px solid #ffeeba" /* Soft yellow border */,
              padding: "5px",
              borderRadius: "5px",
              display: "inline-block",
              width: "100%",
              textAlign: "center",
              fontSize: "medium",
            }}>
            <Label>Bitte nochmal überprüfen !! ALLES korrekt ?</Label>
          </div>
        )}
      </Form>
      {/* <div className="flex justify-center items-center">
      <Icons.spinner className="h-12 w-12 animate-spin" />
      </div> */}
    </>
  );
}
