import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfilePageLayout({
  title,
  description,
  children,
  className,
  maxWidthClassName = "max-w-4xl",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidthClassName?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto space-y-8 pb-12",
        maxWidthClassName,
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function ProfilePageSkeleton({
  variant = "full",
  maxWidthClassName = "max-w-4xl",
}: {
  variant?: "full" | "compact";
  maxWidthClassName?: string;
}) {
  if (variant === "compact") {
    return (
      <div className={cn("mx-auto space-y-6", maxWidthClassName)}>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }
  return (
    <div className={cn("mx-auto space-y-6", maxWidthClassName)}>
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}
