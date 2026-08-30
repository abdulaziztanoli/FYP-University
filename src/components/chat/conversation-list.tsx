"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatChatTimestamp } from "@/lib/chat-format";
import type { ConversationRow } from "@/hooks/use-conversations";

export function ConversationList({
  conversations,
  isLoading,
  selectedId,
  onSelect,
  role,
}: {
  conversations: ConversationRow[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  role: "company" | "student";
}) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-muted-foreground p-6 text-center text-sm">
        {role === "company"
          ? "No applicants have opened a chat yet."
          : "Apply to a job to start messaging a company."}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[60vh] lg:h-[70vh]">
      <ul className="divide-border/60 divide-y">
        {conversations.map((c) => {
          const active = c._id === selectedId;
          const initials =
            c.peer?.name?.slice(0, 2).toUpperCase() ??
            c.peer?.email?.slice(0, 2).toUpperCase() ??
            "?";
          return (
            <li key={c._id}>
              <button
                type="button"
                onClick={() => onSelect(c._id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 px-3 py-3 text-left transition-colors",
                  active ? "bg-primary/10" : "hover:bg-muted/60"
                )}
              >
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={c.peer?.avatar || undefined} alt="" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={cn(
                        "truncate text-sm",
                        c.unread > 0 ? "font-semibold" : "font-medium"
                      )}
                    >
                      {c.peer?.name || "Unknown"}
                    </p>
                    <span className="text-muted-foreground shrink-0 text-[11px]">
                      {formatChatTimestamp(c.lastMessageAt)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p
                      className={cn(
                        "min-w-0 flex-1 truncate text-xs",
                        c.unread > 0
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {c.lastMessageBody || "No messages yet"}
                    </p>
                    {c.unread > 0 && (
                      <span
                        className="bg-primary text-primary-foreground flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold"
                        aria-label={`${c.unread} unread`}
                      >
                        {c.unread > 99 ? "99+" : c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
}
