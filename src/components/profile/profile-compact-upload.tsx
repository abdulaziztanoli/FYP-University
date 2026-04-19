import * as React from "react";
import { Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileCompactUpload({
  icon: Icon,
  title,
  description,
  actionLabel,
  accept,
  disabled,
  uploading,
  onFile,
  footer,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  accept: string;
  disabled?: boolean;
  uploading?: boolean;
  onFile: (file: File) => void | Promise<void>;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border/70 bg-background/80 px-3 py-2.5",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 size-3.5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold leading-tight">{title}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <label
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border/80 bg-muted/30 px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/50",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        <input
          type="file"
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            await onFile(f);
            e.target.value = "";
          }}
        />
        {uploading ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="font-medium text-foreground">{actionLabel}</span>
      </label>
      {footer}
    </div>
  );
}
