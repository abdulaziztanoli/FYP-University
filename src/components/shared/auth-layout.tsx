import { Building2 } from "lucide-react";

/** Shared elevated card styling for auth routes */
export const AUTH_CARD_CLASS =
  "rounded-2xl border bg-card/80 backdrop-blur-sm shadow-lg ring-1 ring-border/50";

export function AuthBrandRow() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Building2 className="h-5 w-5" aria-hidden />
      </div>
      <div className="space-y-0.5 pt-0.5">
        <p className="text-foreground font-semibold leading-none tracking-tight">
          Campus Recruitment
        </p>
        <p className="text-muted-foreground text-xs">
          Connect students, employers, and admins.
        </p>
      </div>
    </div>
  );
}
