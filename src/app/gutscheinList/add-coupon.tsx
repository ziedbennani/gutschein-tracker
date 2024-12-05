"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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

const formSchema = z.object({
  id: z.number().min(2).max(6),
  firstValue: z.number().nullable(),
  usedValue: z.number().nullable(),
  restValue: z.number(),
  employee: z.string(),
});

export function ProfileForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

const AddCoupon = ({ data }: any) => {
  // const [dialogOpen, setDialogOpen] = useState(false);

  return (
    //   <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={() => console.log("data : ", data)}>
          Gutschein Erstellen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mitarbeiter Infos</DialogTitle>
          <DialogDescription>Bitte alle Felder ausfüllen</DialogDescription>
        </DialogHeader>

        <ProfileForm />
        {/* <ProfileForm setDialogOpen={setDialogOpen} /> */}
      </DialogContent>
    </Dialog>
  );
};

export default AddCoupon;
