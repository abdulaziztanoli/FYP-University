import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProfileSaveBar({
  hint,
  submitLabel,
  loading,
  icon: Icon,
  className,
}: {
  hint?: string;
  submitLabel: string;
  loading?: boolean;
  icon?: React.ElementType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center",
        hint ? "sm:justify-between" : "sm:justify-end",
        className
      )}
    >
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <Button type="submit" className="gap-2 sm:min-w-[160px]" loading={loading}>
        {Icon ? <Icon className="size-4" /> : null}
        {submitLabel}
      </Button>
    </div>
  );
}
