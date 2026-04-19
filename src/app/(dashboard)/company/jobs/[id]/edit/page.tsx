"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { swrFetcher } from "@/lib/swr-fetcher";
import { jobCreateSchema } from "@/lib/validators";
import type { z } from "zod";

type FormShape = z.infer<typeof jobCreateSchema>;

export default function EditCompanyJobPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data, isLoading } = useSWR(
    id ? `/api/jobs/${id}` : null,
    swrFetcher<{ job: FormShape & { _id: string } }>
  );

  const job = data?.job;

  const form = useForm<FormShape>({
    resolver: zodResolver(jobCreateSchema),
  });

  React.useEffect(() => {
    if (!job) return;
    form.reset({
      title: job.title,
      description: job.description,
      requirements: job.requirements ?? [],
      responsibilities: job.responsibilities ?? [],
      type: job.type,
      location: job.location,
      isRemote: job.isRemote,
      salary: job.salary ?? { min: 0, max: 0, currency: "USD" },
      skills: job.skills ?? [],
      deadline: new Date(job.deadline),
      status: job.status,
      experienceLevel: job.experienceLevel,
      positions: job.positions,
    });
  }, [job, form]);

  const [reqText, setReqText] = React.useState("");
  const [respText, setRespText] = React.useState("");
  const [skillsText, setSkillsText] = React.useState("");
  const [deadlineLocal, setDeadlineLocal] = React.useState("");
  const [savePhase, setSavePhase] = React.useState<null | "save" | "publish">(
    null
  );

  React.useEffect(() => {
    if (!job) return;
    setReqText((job.requirements ?? []).join("\n"));
    setRespText((job.responsibilities ?? []).join("\n"));
    setSkillsText((job.skills ?? []).join(", "));
    const d = new Date(job.deadline);
    setDeadlineLocal(
      new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    );
  }, [job]);

  async function save(publish: boolean) {
    if (!job) return;
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
      status: publish ? ("open" as const) : raw.status ?? "draft",
      deadline: new Date(deadlineLocal),
    };

    const parsed = jobCreateSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error("Validation failed");
      return;
    }

    setSavePhase(publish ? "publish" : "save");
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed.data),
      });

      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Could not save");
        return;
      }
      toast.success("Job updated");
      router.push("/company/jobs");
    } finally {
      setSavePhase(null);
    }
  }

  if (isLoading || !job) {
    return <Skeleton className="mx-auto h-96 max-w-3xl" />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1">
        <Link href="/company/jobs">
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit job</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...form.register("title")} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={6} {...form.register("description")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(v) => form.setValue("type", v as FormShape["type"])}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Label>Experience</Label>
              <Select
                value={form.watch("experienceLevel")}
                onValueChange={(v) =>
                  form.setValue("experienceLevel", v as FormShape["experienceLevel"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Location</Label>
              <Input {...form.register("location")} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                checked={form.watch("isRemote")}
                onCheckedChange={(c) => form.setValue("isRemote", c === true)}
              />
              <Label>Remote-friendly</Label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Salary min</Label>
              <Input
                type="number"
                {...form.register("salary.min", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Salary max</Label>
              <Input
                type="number"
                {...form.register("salary.max", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input {...form.register("salary.currency")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Skills (comma-separated)</Label>
            <Input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Requirements (one per line)</Label>
            <Textarea rows={4} value={reqText} onChange={(e) => setReqText(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Responsibilities (one per line)</Label>
            <Textarea rows={4} value={respText} onChange={(e) => setRespText(e.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input
                type="datetime-local"
                value={deadlineLocal}
                onChange={(e) => setDeadlineLocal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Positions</Label>
              <Input
                type="number"
                min={1}
                {...form.register("positions", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              loading={savePhase === "save"}
              onClick={() => void save(false)}
            >
              Save changes
            </Button>
            <Button
              type="button"
              loading={savePhase === "publish"}
              onClick={() => void save(true)}
            >
              Save & publish
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
