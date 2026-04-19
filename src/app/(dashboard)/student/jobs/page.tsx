"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ArrowRight,
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  Filter,
  GraduationCap,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { swrFetcher } from "@/lib/swr-fetcher";
import { jobStatusBadgeClass } from "@/lib/status-styles";
import { cn } from "@/lib/utils";

type CompanyPop = {
  companyProfile?: { companyName?: string; logo?: string };
  name?: string;
};
type JobRow = {
  _id: string;
  title: string;
  location: string;
  type: string;
  deadline: string;
  isRemote: boolean;
  status?: string;
  salary?: { min?: number; max?: number; currency?: string };
  company?: CompanyPop | string;
};

function buildQuery(state: Record<string, string>) {
  const qs = new URLSearchParams();
  Object.entries(state).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  return qs.toString();
}

function formatJobType(type: string) {
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function StudentJobsPage() {
  const [type, setType] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [experience, setExperience] = React.useState("");
  const [remote, setRemote] = React.useState<"any" | "true" | "false">("any");
  const [skills, setSkills] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const qs = React.useMemo(
    () =>
      buildQuery({
        type,
        location,
        experience,
        ...(remote !== "any" ? { remote } : {}),
        ...(skills ? { skills } : {}),
        ...(debouncedQ ? { search: debouncedQ } : {}),
        limit: "20",
      }),
    [type, location, experience, remote, skills, debouncedQ]
  );

  const key = qs ? `/api/jobs?${qs}` : "/api/jobs?limit=20";
  const { data, isLoading } = useSWR(key, swrFetcher<{ jobs: JobRow[] }>);

  const jobs = data?.jobs ?? [];

  const hasActiveFilters =
    Boolean(type || location || experience || skills || debouncedQ || remote !== "any");

  const activeFilterCount = React.useMemo(
    () =>
      [
        type,
        location,
        experience,
        skills,
        debouncedQ,
        remote !== "any" ? "1" : "",
      ].filter(Boolean).length,
    [type, location, experience, skills, debouncedQ, remote]
  );

  function clearFilters() {
    setType("");
    setLocation("");
    setExperience("");
    setRemote("any");
    setSkills("");
    setSearch("");
    setDebouncedQ("");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Browse jobs</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Search and filter roles from verified employers. Save interesting listings and apply when
          you are ready.
        </p>
      </div>

      {/* Search & filters — layered hero + fine-tune grid */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-xl shadow-primary/[0.07] ring-1 ring-foreground/5">
        {/* Ambient accents */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl dark:bg-primary/15"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-chart-2/30 blur-3xl dark:bg-chart-2/15"
          aria-hidden
        />

        {/* Top: headline + primary search */}
        <div className="relative border-b border-border/50 bg-linear-to-br from-primary/9 via-card/95 to-transparent px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
                <Filter className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
                  Discover roles
                </p>
                <h2 className="text-lg font-bold leading-tight tracking-tight sm:text-xl">
                  Search & filters
                </h2>
              </div>
            </div>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 shrink-0 gap-1.5 rounded-full border border-border/80 bg-background/80 px-3 text-xs shadow-sm backdrop-blur-sm"
                onClick={clearFilters}
              >
                Clear all
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground">
                  {activeFilterCount}
                </span>
              </Button>
            ) : null}
          </div>

          <div className="relative mt-3">
            <Label htmlFor="job-search" className="sr-only">
              Search jobs
            </Label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="job-search"
              placeholder="Title, company, or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "rounded-xl border-2 border-border/70 bg-background/90 pl-10 pr-3 text-sm shadow-inner",
                "placeholder:text-muted-foreground/75",
                "transition-[border-color,box-shadow] duration-200",
                "focus-visible:border-primary/55 focus-visible:ring-2 focus-visible:ring-primary/15"
              )}
            />
          </div>
        </div>

        {/* Bottom: fine-tune */}
        <div className="relative bg-muted/25 px-4 py-4 sm:px-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-background shadow-sm ring-1 ring-border/60">
              <SlidersHorizontal className="size-3.5 text-primary" aria-hidden />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Fine-tune
            </span>
            <div className="h-px min-w-6 flex-1 bg-linear-to-r from-border via-border/50 to-transparent" />
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Briefcase className="size-3 text-primary" aria-hidden />
                Employment type
              </Label>
              <Select value={type || "any"} onValueChange={(v) => setType(v === "any" ? "" : v)}>
                <SelectTrigger className="w-full rounded-lg border-border/80 bg-background text-sm shadow-sm">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <GraduationCap className="size-3 text-primary" aria-hidden />
                Experience
              </Label>
              <Select
                value={experience || "any"}
                onValueChange={(v) => setExperience(v === "any" ? "" : v)}
              >
                <SelectTrigger className="w-full rounded-lg border-border/80 bg-background text-sm shadow-sm">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Wifi className="size-3 text-primary" aria-hidden />
                Workplace
              </Label>
              <Select value={remote} onValueChange={(v) => setRemote(v as typeof remote)}>
                <SelectTrigger className="h-9 w-full rounded-lg border-border/80 bg-background text-sm shadow-sm">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="true">Remote</SelectItem>
                  <SelectItem value="false">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 md:col-span-2 lg:col-span-3">
              <div className="min-w-0 space-y-1.5">
                <Label
                  htmlFor="job-location"
                  className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  <MapPin className="size-3 text-primary" aria-hidden />
                  Location
                </Label>
                <Input
                  id="job-location"
                  placeholder="City or region"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="min-w-0 rounded-lg border-border/80 bg-background text-sm shadow-sm"
                />
              </div>
              <div className="min-w-0 space-y-1.5">
                <Label
                  htmlFor="job-skills"
                  className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  <Sparkles className="size-3 text-primary" aria-hidden />
                  Skills match
                </Label>
                <Input
                  id="job-skills"
                  placeholder="e.g. React, TypeScript, SQL"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="min-w-0 rounded-lg border-border/80 bg-background text-sm shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
          <h2 className="text-sm font-semibold text-foreground">Open roles</h2>
          {!isLoading ? (
            <span className="text-xs text-muted-foreground">
              {jobs.length} {jobs.length === 1 ? "listing" : "listings"}
            </span>
          ) : null}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Briefcase className="size-6 text-primary/80" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">No jobs match your filters</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try broadening your search or clearing filters to see more roles.
              </p>
            </div>
            {hasActiveFilters ? (
              <Button variant="outline" type="button" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => {
              const company = job.company as CompanyPop | undefined;
              const companyName =
                company?.companyProfile?.companyName ?? company?.name ?? "Company";
              const logo = company?.companyProfile?.logo;
              const initial = companyName.slice(0, 2).toUpperCase();
              const salMin = job.salary?.min ?? 0;
              const salMax = job.salary?.max ?? 0;
              const showSalary = job.salary && (salMin > 0 || salMax > 0);

              return (
                <li key={job._id}>
                  <article
                    className={cn(
                      "group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-all",
                      "hover:border-primary/25 hover:shadow-md"
                    )}
                  >
                    <div className="border-b border-border/50 bg-linear-to-br from-primary/[0.07] to-transparent px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-3">
                          <Avatar className="size-11 shrink-0 ring-2 ring-background">
                            {logo ? (
                              <AvatarImage src={logo} alt="" />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                              {initial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 font-semibold leading-snug tracking-tight group-hover:text-primary">
                              <Link
                                href={`/student/jobs/${job._id}`}
                                className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                {job.title}
                              </Link>
                            </h3>
                            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                              <Building2 className="size-3.5 shrink-0 opacity-70" />
                              {companyName}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 capitalize",
                            jobStatusBadgeClass(job.status ?? "open")
                          )}
                        >
                          {job.status ?? "open"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 text-xs font-medium">
                          {formatJobType(job.type)}
                        </span>
                        {job.isRemote ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                            <Wifi className="size-3" />
                            Remote
                          </span>
                        ) : null}
                      </div>

                      <div className="space-y-2 text-xs text-muted-foreground">
                        <span className="flex items-start gap-2">
                          <MapPin className="mt-0.5 size-3.5 shrink-0" />
                          <span className="line-clamp-2">{job.location}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="size-3.5 shrink-0" />
                          Apply by{" "}
                          {new Date(job.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {showSalary ? (
                          <span className="flex items-center gap-2">
                            <Banknote className="size-3.5 shrink-0" />
                            {job.salary!.currency ?? "USD"}{" "}
                            {salMin.toLocaleString()} – {salMax.toLocaleString()}
                          </span>
                        ) : null}
                      </div>

                      <Separator className="my-1" />

                      <Button
                        className="mt-auto w-full gap-2"
                        asChild
                      >
                        <Link href={`/student/jobs/${job._id}`}>
                          View details
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
