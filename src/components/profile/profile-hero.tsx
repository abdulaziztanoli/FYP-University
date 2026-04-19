import * as React from "react";
import { cn } from "@/lib/utils";

export function ProfileHeroCard({
  banner,
  footer,
  className,
}: {
  banner: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-sm ring-1 ring-foreground/5",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10" />
      {banner}
      {footer}
    </div>
  );
}

export function ProfileIdentityRow({
  avatar,
  accountBadge,
  heading,
  subtitle,
}: {
  avatar: React.ReactNode;
  accountBadge: string;
  heading: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col gap-6 border-b border-border/60 bg-linear-to-br from-primary/10 via-transparent to-muted/30 px-5 py-6 sm:flex-row sm:items-center sm:gap-8 sm:px-8 sm:py-8">
      {avatar}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          {accountBadge}
        </p>
        <h2 className="mt-1 truncate text-xl font-bold tracking-tight sm:text-2xl">
          {heading}
        </h2>
        {subtitle ? (
          <p className="mt-1 truncate text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
