"use client";

import Link from "next/link";
import useSWR from "swr";
import {
  Users,
  Briefcase,
  Star,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { swrFetcher } from "@/lib/swr-fetcher";
import { applicationStatusBadgeClass } from "@/lib/status-styles";
import { cn } from "@/lib/utils";

export default function CompanyDashboardPage() {
  const { data: jobsData, isLoading: jl } = useSWR(
    "/api/jobs?limit=100",
    swrFetcher<{ jobs: { _id: string; status: string; title?: string }[] }>
  );
  const { data: appsData, isLoading: al } = useSWR(
    "/api/applications",
    swrFetcher<{ applications: { status: string }[] }>
  );

  const jobs = jobsData?.jobs ?? [];
  const apps = appsData?.applications ?? [];

  const activeJobs = jobs.filter((j) => j.status === "open").length;
  const shortlisted = apps.filter((a) => a.status === "shortlisted").length;
  const accepted = apps.filter((a) => a.status === "accepted").length;

  const recent = apps.slice(0, 8);

  const statCards = [
    {
      title: "Active jobs",
      value: activeJobs,
      loading: jl,
      icon: Briefcase,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      title: "Total applications",
      value: apps.length,
      loading: al,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Shortlisted",
      value: shortlisted,
      loading: al,
      icon: Star,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Accepted / filled",
      value: accepted,
      loading: al,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your job postings and incoming applications.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/company/jobs">Manage jobs</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/company/jobs/new">
              <PlusCircle className="size-4" />
              Post a job
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Recent applications */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                <Users className="size-3.5 text-blue-600 dark:text-blue-400" />
              </span>
              Recent applications
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-7 gap-1 text-xs text-muted-foreground"
            >
              <Link href="/company/jobs">
                Manage jobs
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {al ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Users className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No applications yet.
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link href="/company/jobs/new">Post your first job</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {recent.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Users className="size-3.5 text-muted-foreground" />
                  </div>
                  <p className="flex-1 text-sm text-muted-foreground">
                    Candidate in pipeline
                  </p>
                  <Badge
                    variant="outline"
                    className={cn("capitalize", applicationStatusBadgeClass(a.status))}
                  >
                    {a.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  loading,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: number;
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
          <p className="text-3xl font-bold tabular-nums tracking-tight">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
