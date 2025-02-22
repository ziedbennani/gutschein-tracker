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
import confetti from "canvas-confetti";
import { Table } from "@tanstack/react-table";

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

interface RedeemFormProps<TData> {
  coupon: Coupon;
  setDialogOpen: (open: boolean) => void;
  onCouponRedeemed?: (couponId: string) => void;
  setIsRedeemReady?: (ready: boolean) => void;
  table?: Table<TData>;
}

export function RedeemForm<TData>({
  coupon,
  setDialogOpen,
  onCouponRedeemed,
  setIsRedeemReady,
  table,
}: RedeemFormProps<TData>) {
  const { toast } = useToast();
  const router = useRouter();
  const [isFormSubmitted, setFormSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usedValue: undefined,
      employee: "",
      location: undefined,
      tip: undefined,
      newId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

      // 3. Show success feedback (toast and confetti)
      toast({
        duration: 3000,
        title: "Gutschein eingelöst",
        description: (
          <span>
            Der Gutschein <strong>{values.newId || coupon.id}</strong> wurde
            erfolgreich eingelöst.
          </span>
        ),
      });

      confetti({
        angle: 90,
        origin: { y: 0.7 },
        colors: [
          "#28AFFA",
          "#054a91",
          "#fff952",
          "#FDC30A",
          "#e71d36",
          "#fd5da5",
        ],
        particleCount: 700,
        spread: 90,
        gravity: 0.5,
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
    }
  }

  const remainingAmount = (field: any) => {
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

  const isPositiveBalance = (field: any) => {
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

              {/* Tip checkbox - commented out but kept for reference */}
              {/* <FormField
                control={form.control}
                name="tip"
                render={({ field, fieldState }) => (
                  <FormItem className="flex items-center space-x-2 mt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormLabel
                      className={cn(
                        fieldState.invalid && "text-red-500",
                        "text-sm font-medium"
                      )}>
                      als Trinkgeld
                    </FormLabel>
                  </FormItem>
                )}
              /> */}
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
            </div>
          </div>
          <div className="flex justify-evenly items-end mt-4 gap-4">
            <FormField
              control={form.control}
              name="tip"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col ">
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
                variant="secondary"
                className="bg-[#FDC30A] hover:bg-[#e3af09] text-black"
                type="button"
                onClick={() => {
                  setFormSubmitted(true);
                }}>
                Gutschein Voll ?
              </Button>
            )}

            <Button
              // style={{ width: "139.25px" }}
              type="submit">
              Bestätigen
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
