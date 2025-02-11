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
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Coupon } from "./columns";

const formSchema = z.object({
  usedValue: z
    .number({
      required_error: "Betrag ist erforderlich",
      invalid_type_error: "Betrag muss eine Zahl sein",
    })
    .min(0.01, "Betrag muss größer als 0 sein"),
  employee: z.string().min(1, "Mitarbeiter ist erforderlich"),
  location: z.enum(["Braugasse", "Transit", "Pit Stop", "Wirges"], {
    required_error: "Laden ist erforderlich",
  }),
});

interface RedeemFormProps {
  coupon: Coupon;
  setDialogOpen: (open: boolean) => void;
}

export function RedeemForm({ coupon, setDialogOpen }: RedeemFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usedValue: undefined,
      employee: "",
      location: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(`/api/coupons/${coupon.id}/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      console.log(response);
      console.log(values);

      if (!response.ok) throw new Error("Failed to redeem coupon");

      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error redeeming coupon:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="usedValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Einzulösender Betrag</FormLabel>
                <FormControl>
                  <Input
                    placeholder="10,00 €"
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground mt-1">
                  Der Restbetrag wird:{" "}
                  {new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  }).format(coupon.restValue - field.value)}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mitarbeiter</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
        <Button type="submit">Einlösen</Button>
      </form>
    </Form>
  );
}
