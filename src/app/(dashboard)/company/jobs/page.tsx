"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Plus,
  Users,
  Pencil,
  Trash2,
  Briefcase,
  Calendar,
  Filter,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { swrFetcher } from "@/lib/swr-fetcher";
import { jobStatusBadgeClass } from "@/lib/status-styles";
import { cn } from "@/lib/utils";

type JobRow = {
  _id: string;
  title: string;
  status: string;
  deadline: string;
  createdAt?: string;
};

export default function CompanyJobsPage() {
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const qs =
    statusFilter === "all"
      ? "/api/jobs?limit=100"
      : `/api/jobs?limit=100&status=${statusFilter}`;

  const { data, isLoading, mutate } = useSWR(qs, swrFetcher<{ jobs: JobRow[] }>);
  const jobs = data?.jobs ?? [];

  const [jobPending, setJobPending] = React.useState<
    null | { id: string; op: "close" | "delete" }
  >(null);

  async function closeJob(id: string) {
    setJobPending({ id, op: "close" });
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "closed" }),
      });
      if (!res.ok) toast.error("Could not update job");
      else {
        toast.success("Job closed");
        await mutate();
      }
    } finally {
      setJobPending(null);
    }
  }

  async function deleteJob(id: string) {
    if (!confirm("Delete this job permanently?")) return;
    setJobPending({ id, op: "delete" });
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) toast.error("Could not delete");
      else {
        toast.success("Job deleted");
        await mutate();
      }
    } finally {
      setJobPending(null);
    }
  }

  const statusDot: Record<string, string> = {
    open: "bg-emerald-500",
    closed: "bg-red-500",
    draft: "bg-gray-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your listings and view applicants.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/company/jobs/new">
            <PlusCircle className="size-4" />
            Post a job
          </Link>
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="size-3.5 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        {!isLoading && (
          <span className="text-sm text-muted-foreground">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
          </span>
        )}
      </div>

      {/* Jobs grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Briefcase className="size-10 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">
            No jobs yet. Post your first listing.
          </p>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/company/jobs/new">
              <Plus className="size-3.5" />
              Post a job
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => {
            const isDeadlineSoon =
              new Date(job.deadline).getTime() - Date.now() <
              3 * 24 * 60 * 60 * 1000;

            return (
              <Card
                key={job._id}
                className="overflow-hidden transition-shadow hover:shadow-md"
              >
                <CardContent className="p-0">
                  {/* Card top */}
                  <div className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "mt-1 h-2 w-2 shrink-0 rounded-full",
                            statusDot[job.status] ?? "bg-gray-400"
                          )}
                        />
                        <h3 className="font-semibold leading-snug">{job.title}</h3>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 capitalize", jobStatusBadgeClass(job.status))}
                      >
                        {job.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        Deadline:{" "}
                        <span
                          className={cn(
                            "font-medium",
                            isDeadlineSoon && job.status === "open"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground"
                          )}
                        >
                          {new Date(job.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </span>
                      {job.createdAt && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="size-3" />
                          Posted:{" "}
                          <span className="font-medium text-foreground">
                            {new Date(job.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-border/50 bg-muted/30 px-4 py-2.5">
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" asChild>
                      <Link href={`/company/jobs/${job._id}/applicants`}>
                        <Users className="size-3.5" />
                        Applicants
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" asChild>
                      <Link href={`/company/jobs/${job._id}/edit`}>
                        <Pencil className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                    {job.status === "open" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 text-xs"
                        loading={
                          jobPending?.id === job._id && jobPending?.op === "close"
                        }
                        onClick={() => void closeJob(job._id)}
                      >
                        Close
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      loading={
                        jobPending?.id === job._id && jobPending?.op === "delete"
                      }
                      onClick={() => void deleteJob(job._id)}
                      aria-label="Delete job"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
