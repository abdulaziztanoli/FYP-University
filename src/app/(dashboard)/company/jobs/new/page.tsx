"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  CalendarClock,
  DollarSign,
  FileText,
  ListChecks,
  MapPin,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { jobCreateSchema } from "@/lib/validators";
import type { z } from "zod";
import { cn } from "@/lib/utils";

type FormValues = z.input<typeof jobCreateSchema>;

function FormSection({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Icon className="size-3.5 text-primary" />
          </span>
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function NewCompanyJobPage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: [],
      responsibilities: [],
      type: "full-time",
      location: "",
      isRemote: false,
      salary: { min: 0, max: 0, currency: "USD" },
      skills: [],
      status: "draft",
      experienceLevel: "entry",
      positions: 1,
    },
  });

  const [reqText, setReqText] = React.useState("");
  const [respText, setRespText] = React.useState("");
  const [skillsText, setSkillsText] = React.useState("");
  const [deadlineLocal, setDeadlineLocal] = React.useState(() => {
    const d = new Date(Date.now() + 86400000 * 14);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });

  const [savePhase, setSavePhase] = React.useState<null | "draft" | "publish">(
    null
  );

  async function submit(publish: boolean) {
    const raw = form.getValues();
    const requirements = reqText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const responsibilities = respText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...raw,
      requirements,
      responsibilities,
      skills,
      status: publish ? ("open" as const) : ("draft" as const),
      deadline: new Date(deadlineLocal),
    };

    const parsed = jobCreateSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error("Check required fields");
      return;
    }

    setSavePhase(publish ? "publish" : "draft");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed.data),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Could not save job");
        return;
      }
      toast.success(publish ? "Job published" : "Draft saved");
      router.push("/company/jobs");
    } finally {
      setSavePhase(null);
    }
  }

  return (
    <div className="mx-auto w-full space-y-8 pb-12">
      {/* Page header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 w-fit gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Link href="/company/jobs">
            <ArrowLeft className="size-4" />
            Back to jobs
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New job posting</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Describe the role, compensation, and timeline. Save a draft anytime, or publish when
            you are ready.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/30 px-6 py-5">
          <CardTitle className="text-base">Job details</CardTitle>
          <CardDescription>
            Required fields are validated when you publish. Drafts can be incomplete.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-10 p-6 sm:p-8">
          <FormSection
            icon={Briefcase}
            title="Role overview"
            description="Clear title and description help students discover your listing."
          >
            <div className="space-y-2">
              <Label htmlFor="job-title">Job title</Label>
              <Input
                id="job-title"
                placeholder="e.g. Frontend Engineer Intern"
                className="text-base"
                {...form.register("title")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-description">Description</Label>
              <Textarea
                id="job-description"
                rows={7}
                placeholder="What is the role about? Team, mission, and what makes it exciting."
                className="min-h-[160px] resize-y"
                {...form.register("description")}
              />
            </div>
          </FormSection>

          <Separator />

          <FormSection
            icon={Users}
            title="Type & experience"
            description="Helps candidates self-filter before applying."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Employment type</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(v) => form.setValue("type", v as FormValues["type"])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Experience level</Label>
                <Select
                  value={form.watch("experienceLevel")}
                  onValueChange={(v) =>
                    form.setValue(
                      "experienceLevel",
                      v as FormValues["experienceLevel"]
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FormSection>

          <Separator />

          <FormSection
            icon={MapPin}
            title="Location"
            description="Where will this person work from?"
          >
            <div className="space-y-2">
              <Label htmlFor="job-location">Office location</Label>
              <Input
                id="job-location"
                placeholder="City, region, or country"
                {...form.register("location")}
              />
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
              <Checkbox
                id="job-remote"
                checked={form.watch("isRemote")}
                onCheckedChange={(c) => form.setValue("isRemote", c === true)}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <Label htmlFor="job-remote" className="cursor-pointer font-medium leading-none">
                  Remote-friendly
                </Label>
                <p className="text-xs text-muted-foreground">
                  Candidates can apply expecting hybrid or fully remote options.
                </p>
              </div>
            </div>
          </FormSection>

          <Separator />

          <FormSection
            icon={DollarSign}
            title="Compensation"
            description="Optional ranges still improve trust; use 0 if undisclosed."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="salary-min">Minimum</Label>
                <Input
                  id="salary-min"
                  type="number"
                  min={0}
                  placeholder="e.g. 60000"
                  {...form.register("salary.min", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary-max">Maximum</Label>
                <Input
                  id="salary-max"
                  type="number"
                  min={0}
                  placeholder="e.g. 90000"
                  {...form.register("salary.max", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary-currency">Currency</Label>
                <Input
                  id="salary-currency"
                  placeholder="USD"
                  maxLength={8}
                  {...form.register("salary.currency")}
                />
              </div>
            </div>
          </FormSection>

          <Separator />

          <FormSection
            icon={Sparkles}
            title="Skills"
            description="Comma-separated tags used for search and matching."
          >
            <div className="space-y-2">
              <Label htmlFor="job-skills">Skills</Label>
              <Input
                id="job-skills"
                placeholder="React, TypeScript, Node.js"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
              />
            </div>
          </FormSection>

          <Separator />

          <FormSection
            icon={ListChecks}
            title="Requirements & responsibilities"
            description="One bullet per line. Keep lines short for readability."
          >
            <div className="space-y-2">
              <Label htmlFor="job-req">Requirements</Label>
              <Textarea
                id="job-req"
                rows={5}
                placeholder={"Bachelor's in CS or related\n2+ years with React\nEligible to work in …"}
                className="resize-y font-mono text-sm leading-relaxed"
                value={reqText}
                onChange={(e) => setReqText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-resp">Responsibilities</Label>
              <Textarea
                id="job-resp"
                rows={5}
                placeholder={"Ship features with the web team\nReview PRs and mentor interns\nPartner with design on UI …"}
                className="resize-y font-mono text-sm leading-relaxed"
                value={respText}
                onChange={(e) => setRespText(e.target.value)}
              />
            </div>
          </FormSection>

          <Separator />

          <FormSection
            icon={CalendarClock}
            title="Publishing"
            description="Deadline is shown to applicants. Open positions defaults to one."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="job-deadline">Application deadline</Label>
                <Input
                  id="job-deadline"
                  type="datetime-local"
                  value={deadlineLocal}
                  onChange={(e) => setDeadlineLocal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-positions">Open positions</Label>
                <Input
                  id="job-positions"
                  type="number"
                  min={1}
                  placeholder="e.g. 3"
                  {...form.register("positions", { valueAsNumber: true })}
                />
              </div>
            </div>
          </FormSection>
        </CardContent>

        <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            loading={savePhase === "draft"}
            onClick={() => void submit(false)}
          >
            Save as draft
          </Button>
          <Button
            type="button"
            className="w-full gap-2 sm:w-auto"
            loading={savePhase === "publish"}
            onClick={() => void submit(true)}
          >
            <Send className="size-4" />
            Publish job
          </Button>
        </div>
      </Card>
    </div>
  );
}
