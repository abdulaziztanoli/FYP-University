"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { swrFetcher } from "@/lib/swr-fetcher";
import { applicationStatusBadgeClass } from "@/lib/status-styles";
import { cn } from "@/lib/utils";

type Row = {
  _id: string;
  status: string;
  appliedAt: string;
  coverLetter?: string;
  job?: { _id?: string; title?: string };
  company?: { companyProfile?: { companyName?: string }; name?: string };
};

function StatCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-xl font-bold tabular-nums tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export default function StudentApplicationsPage() {
  const { data, isLoading } = useSWR(
    "/api/applications",
    swrFetcher<{ applications: Row[] }>
  );

  const rows = data?.applications ?? [];
  const [detail, setDetail] = React.useState<Row | null>(null);

  const statusGroups = {
    pending: rows.filter((r) => r.status === "pending").length,
    shortlisted: rows.filter((r) => r.status === "shortlisted").length,
    accepted: rows.filter((r) => r.status === "accepted").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="mx-auto w-full space-y-8 pb-12">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My applications</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Track every application and open the cover letter you sent. Status updates come from the
          employer.
        </p>
      </div>

      {/* Summary stats */}
      {!isLoading && rows.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total"
            value={rows.length}
            icon={FileText}
            className="border-primary/20 bg-primary/5"
          />
          <StatCard label="Pending" value={statusGroups.pending} icon={Clock} />
          <StatCard
            label="Shortlisted"
            value={statusGroups.shortlisted}
            icon={Sparkles}
          />
          <StatCard
            label="Accepted"
            value={statusGroups.accepted}
            icon={CheckCircle2}
          />
          <StatCard
            label="Rejected"
            value={statusGroups.rejected}
            icon={XCircle}
          />
        </div>
      )}

      {/* List / table */}
      {isLoading ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Send className="size-7 text-primary/80" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold">No applications yet</p>
            <p className="text-sm text-muted-foreground">
              Browse open roles and submit your first application.
            </p>
          </div>
          <Button asChild>
            <Link href="/student/jobs">Browse jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <h2 className="text-sm font-semibold text-foreground">All applications</h2>
            <span className="text-xs text-muted-foreground">
              {rows.length} {rows.length === 1 ? "application" : "applications"}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="font-semibold">Applied</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const company =
                  r.company?.companyProfile?.companyName ??
                  r.company?.name ??
                  "—";
                const jobId = r.job?._id;
                return (
                  <TableRow key={r._id} className="transition-colors hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Briefcase className="size-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium leading-tight">
                            {r.job?.title ?? "Job"}
                          </p>
                          {jobId ? (
                            <Link
                              href={`/student/jobs/${jobId}`}
                              className="text-xs text-primary hover:underline"
                            >
                              View listing
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="size-3.5 shrink-0 opacity-70" />
                        <span className="line-clamp-2">{company}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {r.appliedAt
                        ? new Date(r.appliedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          applicationStatusBadgeClass(r.status)
                        )}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5"
                        onClick={() => setDetail(r)}
                      >
                        <Eye className="size-3.5" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg gap-0 sm:max-w-lg">
          <DialogHeader className="space-y-1 border-b border-border/60 pb-4">
            <DialogTitle className="flex items-start gap-3 pr-8 text-left text-lg leading-snug">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Briefcase className="size-5 text-primary" />
              </span>
              <span className="min-w-0 pt-0.5">
                {detail?.job?.title ?? "Application"}
              </span>
            </DialogTitle>
            <DialogDescription className="pl-[52px] text-left text-sm">
              {detail?.company?.companyProfile?.companyName ??
                detail?.company?.name ??
                "Company"}{" "}
              · Applied{" "}
              {detail?.appliedAt
                ? new Date(detail.appliedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  applicationStatusBadgeClass(detail?.status ?? "")
                )}
              >
                {detail?.status}
              </Badge>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cover letter
              </p>
              <div className="max-h-[min(50vh,320px)] overflow-y-auto rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {detail?.coverLetter?.trim() || "No cover letter was submitted."}
                </p>
              </div>
            </div>

            {detail?.job?._id ? (
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/student/jobs/${detail.job._id}`}>
                  View job listing
                </Link>
              </Button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
