"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AUTH_CARD_CLASS,
  AuthBrandRow,
} from "@/components/shared/auth-layout";
import { forgotPasswordSchema } from "@/lib/validators";

type FormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not send the reset email.");
        return;
      }

      setSentTo(values.email);
    } catch {
      toast.error("Something went wrong.");
    }
  }

  return (
    <Card className={`${AUTH_CARD_CLASS} mx-auto w-full max-w-md`}>
      <CardHeader className="space-y-4">
        <AuthBrandRow />
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {sentTo ? "Check your inbox" : "Forgot password"}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {sentTo
              ? "If that email is registered, a reset link is on its way."
              : "Enter your email and we'll send you a link to choose a new password."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {sentTo ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
              <MailCheck
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden
              />
              <div className="space-y-1 text-sm">
                <p className="font-medium break-all">{sentTo}</p>
                <p className="text-muted-foreground">
                  The link expires in 30 minutes and can be used once. Check your
                  spam folder if it does not arrive.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="h-11 w-full"
              onClick={() => {
                setSentTo(null);
                form.reset();
              }}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                size="auth"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="h-11 w-full"
              loading={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-4 px-6 pt-0 pb-6">
        <Separator />
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
