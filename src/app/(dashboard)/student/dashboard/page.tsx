"use client";

import Link from "next/link";
import useSWR from "swr";
import {
  Briefcase,
  FileText,
  Sparkles,
  Clock,
  Star,
  XCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { swrFetcher } from "@/lib/swr-fetcher";
import { applicationStatusBadgeClass } from "@/lib/status-styles";
import { cn } from "@/lib/utils";

type ApplicationRow = {
  _id: string;
  status: string;
  appliedAt: string;
  job?: { title?: string };
};

type RecommendedJob = {
  _id?: string;
  title?: string;
  company?: { name?: string };
};

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const skills = (
    (user?.studentProfile as { skills?: string[] })?.skills ?? []
  ).filter(Boolean);
  const skillsParam = skills.length ? `&skills=${skills.join(",")}` : "";

  const { data: appsData, isLoading: appsLoading } = useSWR(
    "/api/applications",
    swrFetcher<{ applications: ApplicationRow[] }>
  );

  const { data: recData, isLoading: recLoading } = useSWR(
    skills.length ? `/api/jobs?limit=6${skillsParam}` : "/api/jobs?limit=6",
    swrFetcher<{ jobs: RecommendedJob[] }>
  );

  const applications = appsData?.applications ?? [];
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const recent = applications.slice(0, 5);
  const recommended = (recData?.jobs ?? []).slice(0, 6);

  const statCards = [
    {
      title: "Total applications",
      value: stats.total,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Pending review",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "Shortlisted",
      value: stats.shortlisted,
      icon: Star,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-500 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your applications and discover roles matched to your skills.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <StatCard key={s.title} {...s} loading={appsLoading} />
        ))}
      </div>

      {/* Profile completion nudge if no skills */}
      {!appsLoading && skills.length === 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
          <TrendingUp className="size-5 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Complete your profile</p>
            <p className="text-xs text-muted-foreground">
              Add skills to get personalised job recommendations.
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/student/profile">Update profile</Link>
          </Button>
        </div>
      )}

      {/* Two-column panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recently applied */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="size-3.5 text-blue-600 dark:text-blue-400" />
                </span>
                Recently applied
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-7 gap-1 text-xs text-muted-foreground"
              >
                <Link href="/student/applications">
                  View all
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {appsLoading ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Briefcase className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No applications yet.
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/student/jobs">Browse jobs</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {recent.map((a) => (
                  <li
                    key={a._id}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Briefcase className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {a.job?.title ?? "Job"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.appliedAt
                          ? new Date(a.appliedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : ""}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 capitalize",
                        applicationStatusBadgeClass(a.status)
                      )}
                    >
                      {a.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recommended jobs */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                  <Sparkles className="size-3.5 text-purple-600 dark:text-purple-400" />
                </span>
                Recommended for you
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-7 gap-1 text-xs text-muted-foreground"
              >
                <Link href="/student/jobs">
                  Browse all
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recLoading ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : recommended.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Sparkles className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Add skills to your profile to get matched jobs.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {recommended.map(
                  (job) => (
                    <li
                      key={job._id}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Briefcase className="size-3.5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {job.title}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 shrink-0 text-xs" asChild>
                        <Link href={`/student/jobs/${job._id}`}>View</Link>
                      </Button>
                    </li>
                  )
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
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
