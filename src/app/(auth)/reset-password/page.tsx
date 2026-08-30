"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import {
  AUTH_CARD_CLASS,
  AuthBrandRow,
} from "@/components/shared/auth-layout";
import { resetPasswordSchema } from "@/lib/validators";

type FormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [linkDead, setLinkDead] = React.useState(!token);

  const form = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "INVALID_TOKEN") {
          setLinkDead(true);
          return;
        }
        toast.error(data.error ?? "Could not reset the password.");
        return;
      }

      toast.success("Password updated. Sign in with your new password.");
      router.push("/login");
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
            {linkDead ? "Link expired" : "Set a new password"}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {linkDead
              ? "Reset links are valid for 30 minutes and work only once."
              : "Choose a password you have not used on this account before."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {linkDead ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <TriangleAlert
                className="mt-0.5 size-5 shrink-0 text-destructive"
                aria-hidden
              />
              <p className="text-sm leading-relaxed">
                This reset link is invalid or has already been used. Request a
                fresh one to continue.
              </p>
            </div>
            <Button asChild className="h-11 w-full">
              <Link href="/forgot-password">Request a new link</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <input type="hidden" {...form.register("token")} />
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                size="auth"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                size="auth"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="h-11 w-full"
              loading={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Updating…" : "Update password"}
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

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={null}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
