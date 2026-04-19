import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ProfileDetailsCard({
  icon: Icon,
  title,
  description,
  children,
  className,
  contentClassName,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={cn("overflow-hidden border-border/80 shadow-sm", className)}>
      <CardHeader className="border-b border-border/60 bg-muted/25 px-5 py-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon ? <Icon className="size-4 text-primary" /> : null}
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn("p-5 sm:p-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
