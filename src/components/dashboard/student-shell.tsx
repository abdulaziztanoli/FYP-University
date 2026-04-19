"use client";

import * as React from "react";
import { Briefcase, FileText, LayoutDashboard, User } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const navItems = [
  {
    href: "/student/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    href: "/student/jobs",
    label: "Browse jobs",
    icon: <Briefcase className="size-4" />,
  },
  {
    href: "/student/applications",
    label: "Applications",
    icon: <FileText className="size-4" />,
  },
  {
    href: "/student/profile",
    label: "Profile",
    icon: <User className="size-4" />,
  },
];

export function StudentShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="student" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
