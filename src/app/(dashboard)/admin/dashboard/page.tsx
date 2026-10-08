"use client";

import * as React from "react";
import useSWR from "swr";
import {
  Users,
  GraduationCap,
  Building2,
  Briefcase,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { swrFetcher } from "@/lib/swr-fetcher";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data: usersAll, isLoading: u1 } = useSWR(
    "/api/admin/users?page=1&limit=1",
    swrFetcher<{ pagination: { total: number } }>
  );
  const { data: students, isLoading: u3 } = useSWR(
    "/api/admin/users?role=student&page=1&limit=1",
    swrFetcher<{ pagination: { total: number } }>
  );
  const { data: companies, isLoading: u4 } = useSWR(
    "/api/admin/users?role=company&page=1&limit=1",
    swrFetcher<{ pagination: { total: number } }>
  );
  const { data: jobs, isLoading: j1 } = useSWR(
    "/api/jobs?page=1&limit=1",
    swrFetcher<{ pagination: { total: number } }>
  );
  const { data: apps, isLoading: a1 } = useSWR(
    "/api/applications",
    swrFetcher<{ total?: number }>
  );

  const loading = u1 || u3 || u4 || j1 || a1;

  const { data: recentUsers } = useSWR(
    "/api/admin/users?page=1&limit=8",
    swrFetcher<{
      users: {
        _id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        createdAt?: string;
      }[];
    }>
  );

  const metrics = [
    {
      title: "Total users",
      value: usersAll?.pagination.total,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Students",
      value: students?.pagination.total,
      icon: GraduationCap,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Companies",
      value: companies?.pagination.total,
      icon: Building2,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Jobs posted",
      value: jobs?.pagination.total,
      icon: Briefcase,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      title: "Applications",
      value: apps?.total ?? "—",
      icon: FileText,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-100 dark:bg-pink-900/30",
    },
  ];

  const roleColors: Record<string, string> = {
    student: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    company: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform overview and recent signups.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users" className="gap-2">
            User management
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {/* Metric grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} loading={loading} />
        ))}
      </div>

      {/* Recent signups */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                <Users className="size-3.5 text-blue-600 dark:text-blue-400" />
              </span>
              Recent signups
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-muted-foreground">
              <Link href="/admin/users">View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!recentUsers?.users?.length ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No users yet.
            </p>
          ) : (
            <ul className="divide-y divide-border/50">
              {recentUsers.users.map((u) => (
                <li
                  key={u._id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {u.name?.slice(0, 2).toUpperCase() ?? "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                      roleColors[u.role] ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  loading,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value?: number | string;
  loading?: boolean;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", bg)}>
            <Icon className={cn("size-3.5", color)} />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-12 rounded-md" />
        ) : (
          <p className="text-2xl font-bold tabular-nums tracking-tight">
            {value ?? 0}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
