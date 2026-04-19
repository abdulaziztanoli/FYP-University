"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AuthHydration } from "@/components/shared/auth-hydration";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthHydration />
      {children}
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
