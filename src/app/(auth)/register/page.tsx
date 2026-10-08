"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerSchema } from "@/lib/validators";
import type { z } from "zod";

/**
 * zod v4 splits a schema's input and output types: `z.coerce.number()` accepts
 * `unknown` going in and yields `number` coming out. react-hook-form needs both
 * — the field values it holds are the input type, what `handleSubmit` receives
 * is the output type.
 */
type FormInput = z.input<typeof registerSchema>;
type FormValues = z.output<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
      university: "",
      degree: "",
      graduationYear: new Date().getFullYear(),
      companyName: "",
      industry: "",
      website: "",
    },
  });

  const role = form.watch("role");

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }
      toast.success("Account created. You can sign in now.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong.");
    }
  }

  return (
    <Card className={AUTH_CARD_CLASS}>
      <CardHeader className="space-y-4">
        <AuthBrandRow />
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Create account
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Join as a student or a company.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>I am a</Label>
            <Select
              value={role}
              onValueChange={(v) =>
                form.setValue("role", v as FormValues["role"])
              }
            >
              <SelectTrigger size="auth" className="w-full">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="e.g. Alex Morgan"
              size="auth"
              {...form.register("name")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              size="auth"
              {...form.register("email")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              size="auth"
              {...form.register("password")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              size="auth"
              {...form.register("confirmPassword")}
            />
          </div>

          {role === "student" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  placeholder="e.g. University of Karachi"
                  size="auth"
                  {...form.register("university")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  placeholder="e.g. BS Computer Science"
                  size="auth"
                  {...form.register("degree")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation year</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  placeholder="e.g. 2027"
                  size="auth"
                  {...form.register("graduationYear", { valueAsNumber: true })}
                />
              </div>
            </>
          )}

          {role === "company" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  placeholder="e.g. Northwind Technologies"
                  size="auth"
                  {...form.register("companyName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g. Software & IT Services"
                  size="auth"
                  {...form.register("industry")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://example.com"
                  size="auth"
                  {...form.register("website")}
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            className="h-11 w-full"
            loading={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Submitting…" : "Register"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4 px-6 pt-0 pb-6">
        <Separator />
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium underline underline-offset-4 hover:text-primary/90"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
