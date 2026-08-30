"use client";

import * as React from "react";
import {
  Briefcase,
  LayoutDashboard,
  MessagesSquare,
  PlusCircle,
  User,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UnreadBadge } from "@/components/chat/unread-badge";

const navItems = [
  {
    href: "/company/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    href: "/company/jobs",
    label: "Jobs",
    icon: <Briefcase className="size-4" />,
  },
  {
    href: "/company/jobs/new",
    label: "Post job",
    icon: <PlusCircle className="size-4" />,
  },
  {
    href: "/company/messages",
    label: "Messages",
    icon: <MessagesSquare className="size-4" />,
    badge: <UnreadBadge />,
  },
  {
    href: "/company/profile",
    label: "Profile",
    icon: <User className="size-4" />,
  },
];

export function CompanyShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="company" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
