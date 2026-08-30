"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Code2,
  FileText,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Share2,
  Sparkles,
  StickyNote,
  User,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { swrFetcher } from "@/lib/swr-fetcher";
import { MessageButton } from "@/components/chat/message-button";
import { applicationStatusBadgeClass } from "@/lib/status-styles";
import { cn } from "@/lib/utils";

type StudentPop = {
  _id: string;
  name: string;
  email: string;
  studentProfile?: Record<string, unknown>;
};

type AppRow = {
  _id: string;
  status: string;
  appliedAt: string;
  notes?: string;
  coverLetter?: string;
  /** Snapshot taken at submit time; absent on pre-requirement applications. */
  resumeUrl?: string;
  resumeName?: string;
  student?: StudentPop;
};

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.id as string;

  const { data, isLoading, mutate } = useSWR(
    jobId ? `/api/applications?jobId=${jobId}` : null,
    swrFetcher<{ applications: AppRow[] }>
  );

  const rows = data?.applications ?? [];
  const [sheet, setSheet] = React.useState<AppRow | null>(null);
  const [notesDraft, setNotesDraft] = React.useState("");
  const [statusUpdatingId, setStatusUpdatingId] = React.useState<string | null>(
    null
  );
  const [notesSaving, setNotesSaving] = React.useState(false);

  React.useEffect(() => {
    if (sheet) setNotesDraft(sheet.notes ?? "");
  }, [sheet]);

  async function updateStatus(id: string, status: string) {
    setStatusUpdatingId(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) toast.error("Could not update");
      else {
        toast.success("Updated");
        await mutate();
      }
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function saveNotes(id: string) {
    setNotesSaving(true);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes: notesDraft }),
      });
      if (!res.ok) toast.error("Could not save notes");
      else {
        toast.success("Notes saved");
        await mutate();
        setSheet(null);
      }
    } finally {
      setNotesSaving(false);
    }
  }

  const sp = (sheet?.student?.studentProfile ?? {}) as Record<string, unknown>;
  // Prefer what was actually submitted; fall back to the profile copy only for
  // applications created before a resume was required.
  const submittedResumeUrl =
    sheet?.resumeUrl?.trim() || String(sp.resumeUrl ?? "").trim();
  const skillsList = ((sp.skills as string[] | undefined) ?? []).filter(Boolean);
  const studentInitial =
    sheet?.student?.name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1">
        <Link href="/company/jobs">
          <ArrowLeft className="size-4" />
          Jobs
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Applicants</h1>
        <p className="text-muted-foreground text-sm">
          Review candidates and update pipeline status.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Education</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const st = r.student;
                const profile = (st?.studentProfile ?? {}) as Record<string, unknown>;
                const skills = (profile.skills as string[] | undefined)?.join(", ") ?? "—";
                return (
                  <TableRow key={r._id}>
                    <TableCell className="font-medium">{st?.name ?? "—"}</TableCell>
                    <TableCell>
                      {(profile.degree as string) ?? "—"} · {(profile.university as string) ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{skills}</TableCell>
                    <TableCell>
                      {r.appliedAt ? new Date(r.appliedAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.status}
                        onValueChange={(v) => void updateStatus(r._id, v)}
                        disabled={statusUpdatingId === r._id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">pending</SelectItem>
                          <SelectItem value="reviewed">reviewed</SelectItem>
                          <SelectItem value="shortlisted">shortlisted</SelectItem>
                          <SelectItem value="rejected">rejected</SelectItem>
                          <SelectItem value="accepted">accepted</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setSheet(r)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
      )}

      <Sheet open={!!sheet} onOpenChange={() => setSheet(null)}>
        <SheetContent className="flex h-full max-h-screen w-full flex-col gap-0 overflow-hidden border-l p-0 sm:max-w-xl">
          {/* Header */}
          <div className="border-b border-border/60 bg-linear-to-br from-primary/10 via-primary/5 to-transparent px-6 pb-5 pt-6 pr-14">
            <SheetHeader className="space-y-4 p-0">
              <div className="flex items-start gap-4">
                <Avatar className="size-16 shrink-0 ring-2 ring-primary/20 ring-offset-2">
                  {(sp.profilePicture as string) ? (
                    <AvatarImage
                      src={String(sp.profilePicture)}
                      alt=""
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary/15 text-lg font-bold text-primary">
                    {studentInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="text-lg font-bold leading-snug">
                    {sheet?.student?.name ?? "Applicant"}
                  </SheetTitle>
                  <a
                    href={`mailto:${sheet?.student?.email}`}
                    className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Mail className="size-3.5 shrink-0" />
                    {sheet?.student?.email}
                  </a>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {sheet?.status ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          applicationStatusBadgeClass(sheet.status)
                        )}
                      >
                        {sheet.status}
                      </Badge>
                    ) : null}
                    {sheet?.appliedAt ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        Applied{" "}
                        {new Date(sheet.appliedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    ) : null}
                  </div>
                  {sheet?.student?._id ? (
                    <div className="mt-3">
                      <MessageButton
                        peerId={sheet.student._id}
                        role="company"
                        label="Message applicant"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </SheetHeader>
          </div>

          {/* Scrollable body */}
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <ApplicantSection icon={GraduationCap} label="Education">
              <div className="grid gap-2 sm:grid-cols-2">
                <ApplicantInfoTile
                  label="University"
                  value={String(sp.university ?? "—")}
                />
                <ApplicantInfoTile
                  label="Degree"
                  value={String(sp.degree ?? "—")}
                />
                <ApplicantInfoTile
                  label="Major"
                  value={String(sp.major ?? "—")}
                />
                <ApplicantInfoTile
                  label="Graduation"
                  value={
                    sp.graduationYear != null
                      ? String(sp.graduationYear)
                      : "—"
                  }
                />
                {sp.gpa != null && Number(sp.gpa) > 0 ? (
                  <ApplicantInfoTile
                    label="GPA"
                    value={String(sp.gpa)}
                  />
                ) : null}
              </div>
            </ApplicantSection>

            {skillsList.length > 0 ? (
              <ApplicantSection icon={Sparkles} label="Skills">
                <div className="flex flex-wrap gap-1.5">
                  {skillsList.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </ApplicantSection>
            ) : null}

            {String(sp.bio ?? "").trim() ? (
              <ApplicantSection icon={User} label="About">
                <p className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm leading-relaxed">
                  {String(sp.bio)}
                </p>
              </ApplicantSection>
            ) : null}

            <ApplicantSection icon={FileText} label="Resume">
              {submittedResumeUrl ? (
                <a
                  href={submittedResumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm transition-colors hover:bg-muted hover:text-primary"
                >
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">
                    {sheet?.resumeName?.trim() || "Open resume"}
                  </span>
                  {!sheet?.resumeUrl ? (
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      from profile
                    </span>
                  ) : null}
                  <Globe className="size-3 shrink-0 text-muted-foreground/60" />
                </a>
              ) : (
                <p className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                  No resume on file for this application.
                </p>
              )}
            </ApplicantSection>

            <ApplicantSection icon={FileText} label="Cover letter">
              <p className="whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/30 px-3 py-3 text-sm leading-relaxed text-muted-foreground">
                {sheet?.coverLetter?.trim() || "No cover letter provided."}
              </p>
            </ApplicantSection>

            {(sp.location as string) ||
            (sp.phone as string) ||
            (sp.linkedIn as string) ||
            (sp.github as string) ? (
              <ApplicantSection icon={Globe} label="Links & contact">
                <div className="space-y-2">
                  {(sp.location as string) ? (
                    <ApplicantLinkRow
                      icon={MapPin}
                      label={String(sp.location)}
                    />
                  ) : null}
                  {(sp.phone as string) ? (
                    <a
                      href={`tel:${String(sp.phone)}`}
                      className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-primary"
                    >
                      <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                      <span>{String(sp.phone)}</span>
                    </a>
                  ) : null}
                  {(sp.linkedIn as string) ? (
                    <a
                      href={String(sp.linkedIn)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-primary"
                    >
                      <Share2 className="size-3.5 shrink-0 text-muted-foreground" />
                      <span>LinkedIn profile</span>
                      <Globe className="ml-auto size-3 text-muted-foreground/60" />
                    </a>
                  ) : null}
                  {(sp.github as string) ? (
                    <a
                      href={String(sp.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-primary"
                    >
                      <Code2 className="size-3.5 shrink-0 text-muted-foreground" />
                      <span>GitHub profile</span>
                      <Globe className="ml-auto size-3 text-muted-foreground/60" />
                    </a>
                  ) : null}
                </div>
              </ApplicantSection>
            ) : null}
          </div>

          {/* Notes footer */}
          <div className="shrink-0 space-y-3 border-t border-border bg-muted/40 px-6 py-5">
            <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <StickyNote className="size-3.5" />
              Internal notes
            </Label>
            <Textarea
              rows={4}
              className="resize-none bg-background"
              placeholder="Private notes for your team only…"
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
            />
            <Button
              className="w-full sm:w-auto"
              loading={notesSaving}
              onClick={() => sheet && void saveNotes(sheet._id)}
            >
              Save notes
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ApplicantSection({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Icon className="size-3.5 text-primary" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="h-px min-w-0 flex-1 bg-border/60" />
      </div>
      {children}
    </div>
  );
}

function ApplicantInfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium leading-snug">{value}</p>
    </div>
  );
}

function ApplicantLinkRow({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <span>{label}</span>
    </div>
  );
}
