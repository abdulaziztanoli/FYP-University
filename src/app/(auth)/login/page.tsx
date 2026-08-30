"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import {
  AUTH_CARD_CLASS,
  AuthBrandRow,
} from "@/components/shared/auth-layout";
import { loginSchema } from "@/lib/validators";
import { useAuthStore, type AuthUser } from "@/stores/auth-store";

type FormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.code === "PENDING"
            ? "Account pending approval by admin."
            : data.code === "BLOCKED"
              ? "Your account has been blocked. Contact admin."
              : data.error ?? "Could not sign in.";
        toast.error(msg);
        return;
      }

      const u = data.user as AuthUser;
      setUser(u);

      const roleHome =
        u.role === "admin"
          ? "/admin/dashboard"
          : u.role === "company"
            ? "/company/dashboard"
            : "/student/dashboard";

      router.push(roleHome);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    }
  }

  return (
    <Card
      className={`${AUTH_CARD_CLASS} mx-auto w-full max-w-md`}
    >
      <CardHeader className="space-y-4">
        <AuthBrandRow />
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Sign in
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Use your campus recruitment account.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
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
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              size="auth"
              {...form.register("password")}
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full"
            loading={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4 px-6 pt-0 pb-6">
        <Separator />
        <p className="text-muted-foreground text-center text-sm">
          No account?{" "}
          <Link
            href="/register"
            className="text-primary font-medium underline underline-offset-4 hover:text-primary/90"
          >
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
