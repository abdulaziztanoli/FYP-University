"use client";

import * as React from "react";
import { LayoutDashboard, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: <Users className="size-4" />,
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="admin" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
