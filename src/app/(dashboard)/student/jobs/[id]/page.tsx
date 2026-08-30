"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ListTodo,
  MapPin,
  Send,
  Sparkles,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { swrFetcher } from "@/lib/swr-fetcher";
import { useAuthStore } from "@/stores/auth-store";
import {
  ResumePicker,
  type ResumeSelection,
} from "@/components/applications/resume-picker";
import { cn } from "@/lib/utils";

type JobDetail = {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  type: string;
  location: string;
  isRemote: boolean;
  deadline: string;
  salary?: { min?: number; max?: number; currency?: string };
  skills?: string[];
  experienceLevel?: string;
  company?: {
    companyProfile?: { companyName?: string; logo?: string; description?: string };
    name?: string;
  };
};

function formatJobType(type: string) {
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatExperience(level?: string) {
  if (!level) return "—";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function MetaItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5",
        className
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium leading-snug">{value}</p>
      </div>
    </div>
  );
}

export default function StudentJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading } = useSWR(
    id ? `/api/jobs/${id}` : null,
    swrFetcher<{ job: JobDetail }>
  );

  const { data: appsData, mutate: mutateApps } = useSWR(
    "/api/applications",
    swrFetcher<{ applications: { job?: { _id?: string }; _id: string }[] }>
  );

  const storedUser = useAuthStore((s) => s.user);

  const job = data?.job;
  const applications = appsData?.applications ?? [];
  const applied = applications.some((a) => {
    const jid =
      a.job && typeof a.job === "object" && "_id" in a.job
        ? (a.job as { _id: string })._id
        : a.job;
    return String(jid) === id;
  });

  const [coverLetter, setCoverLetter] = React.useState("");
  const [resume, setResume] = React.useState<ResumeSelection>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const profileResumeUrl = String(
    (storedUser?.studentProfile as { resumeUrl?: string } | undefined)
      ?.resumeUrl ?? ""
  );

  async function submitApplication() {
    if (!resume) {
      toast.error("Attach a resume before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          jobId: id,
          coverLetter,
          resumeUrl: resume.url,
          resumeName: resume.name,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Could not apply");
        return;
      }
      toast.success("Application submitted");
      setOpen(false);
      setCoverLetter("");
      setResume(null);
      await mutateApps();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !job) {
    return (
      <div className="mx-auto w-full space-y-6">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const companyName =
    job.company?.companyProfile?.companyName ?? job.company?.name ?? "Company";
  const logoUrl = job.company?.companyProfile?.logo ?? "";
  const companyInitial = companyName.slice(0, 2).toUpperCase();

  const salaryMin = job.salary?.min ?? 0;
  const salaryMax = job.salary?.max ?? 0;

  const salaryLabel =
    job.salary && (salaryMin > 0 || salaryMax > 0)
      ? `${job.salary.currency ?? "USD"} ${salaryMin.toLocaleString()} – ${salaryMax.toLocaleString()}`
      : null;

  return (
    <div className="mx-auto w-full space-y-8 pb-12">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <Link href="/student/jobs">
          <ArrowLeft className="size-4" />
          Back to jobs
        </Link>
      </Button>

      <article className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        {/* Hero */}
        <div className="border-b border-border/60 bg-linear-to-br from-primary/12 via-primary/5 to-transparent px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <Avatar className="size-14 shrink-0 ring-2 ring-primary/15 ring-offset-2">
                {logoUrl ? (
                  <AvatarImage src={logoUrl} alt="" />
                ) : null}
                <AvatarFallback className="bg-primary/15 text-base font-bold text-primary">
                  {companyInitial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                  {job.title}
                </h1>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="size-3.5 shrink-0" />
                  <span className="truncate">{companyName}</span>
                </p>
              </div>
            </div>

            <div className="shrink-0 sm:pt-1">
              {applied ? (
                <Badge className="gap-1 bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-600">
                  <CheckCircle2 className="size-3.5" />
                  Applied
                </Badge>
              ) : (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2 sm:w-auto">
                      <Send className="size-4" />
                      Apply now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="gap-0 sm:max-w-lg">
                    <DialogHeader className="space-y-2 pb-2">
                      <DialogTitle>Apply for this role</DialogTitle>
                      <DialogDescription>
                        Add a short cover letter. Employers see this with your profile.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <ResumePicker
                        profileResumeUrl={profileResumeUrl}
                        value={resume}
                        onChange={setResume}
                        disabled={submitting}
                      />
                      <div className="space-y-2">
                        <Label htmlFor="cover">Cover letter</Label>
                        <Textarea
                          id="cover"
                          rows={7}
                          className="min-h-[150px] resize-y"
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          placeholder="Introduce yourself, relevant experience, and why you want this role…"
                        />
                      </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        loading={submitting}
                        disabled={!resume}
                        onClick={() => void submitApplication()}
                      >
                        Submit application
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Quick facts */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetaItem
              icon={Briefcase}
              label="Type"
              value={formatJobType(job.type)}
            />
            <MetaItem
              icon={Sparkles}
              label="Experience"
              value={formatExperience(job.experienceLevel)}
            />
            <MetaItem icon={MapPin} label="Location" value={job.location || "—"} />
            <MetaItem
              icon={Calendar}
              label="Apply by"
              value={new Date(job.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            />
          </div>

          {(job.isRemote || salaryLabel) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {job.isRemote && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                  <Wifi className="size-3" />
                  Remote-friendly
                </span>
              )}
              {salaryLabel ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium">
                  <Banknote className="size-3 text-muted-foreground" />
                  {salaryLabel}
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="space-y-8 px-5 py-8 sm:px-8">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Briefcase className="size-4 text-primary" />
              About the role
            </h2>
            <div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {job.description}
              </p>
            </div>
          </section>

          {job.requirements?.length ? (
            <>
              <Separator />
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <ListTodo className="size-4 text-primary" />
                  Requirements
                </h2>
                <ul className="space-y-2.5">
                  {job.requirements.map((r) => (
                    <li
                      key={r}
                      className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : null}

          {job.responsibilities?.length ? (
            <>
              <Separator />
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary" />
                  Responsibilities
                </h2>
                <ul className="space-y-2.5">
                  {job.responsibilities.map((r) => (
                    <li
                      key={r}
                      className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : null}

          {job.skills?.length ? (
            <>
              <Separator />
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            </>
          ) : null}
        </div>
      </article>
    </div>
  );
}
