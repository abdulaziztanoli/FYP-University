"use client";

import * as React from "react";
import { Check, FileText, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ResumeSelection = { url: string; name: string } | null;

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Required resume field for the apply dialog.
 *
 * Offers the resume already on the student's profile as a one-click default and
 * lets them upload a job-specific PDF instead. Whichever they pick is snapshotted
 * onto the application, so a later profile change never rewrites it.
 */
export function ResumePicker({
  profileResumeUrl,
  value,
  onChange,
  disabled,
}: {
  profileResumeUrl: string;
  value: ResumeSelection;
  onChange: (next: ResumeSelection) => void;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const usingProfile = !!value && value.url === profileResumeUrl;

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Resume must be a PDF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Resume must be under 5MB.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Upload failed");
      onChange({ url: body.url as string, name: file.name });
      toast.success("Resume attached");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor="resume-upload">Resume</Label>
        <span className="text-destructive text-sm" aria-hidden>
          *
        </span>
        <span className="sr-only">(required)</span>
      </div>

      {value ? (
        <div className="flex items-center gap-2.5 rounded-lg border border-emerald-600/30 bg-emerald-600/5 px-3 py-2.5">
          <Check className="size-4 shrink-0 text-emerald-600" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {value.name || "Resume attached"}
            </p>
            <p className="text-muted-foreground text-xs">
              {usingProfile ? "From your profile" : "Uploaded for this application"}
            </p>
          </div>
          <a
            href={value.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary shrink-0 text-xs font-medium underline underline-offset-2"
          >
            View
          </a>
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled || uploading}
            className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer rounded p-1 disabled:pointer-events-none"
            aria-label="Remove attached resume"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "space-y-2 rounded-lg border border-dashed p-3",
            "border-border/80"
          )}
        >
          {profileResumeUrl ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              disabled={disabled || uploading}
              onClick={() =>
                onChange({ url: profileResumeUrl, name: "Profile resume" })
              }
            >
              <FileText className="size-4" />
              Use my profile resume
            </Button>
          ) : (
            <p className="text-muted-foreground text-xs">
              No resume on your profile yet — upload one to apply.
            </p>
          )}

          <Button
            type="button"
            variant={profileResumeUrl ? "ghost" : "outline"}
            size="sm"
            className="w-full justify-start gap-2"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {uploading ? "Uploading…" : "Upload a PDF"}
          </Button>

          <input
            ref={inputRef}
            id="resume-upload"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <p className="text-muted-foreground text-[11px]">
            PDF only · max 5MB
          </p>
        </div>
      )}
    </div>
  );
}
