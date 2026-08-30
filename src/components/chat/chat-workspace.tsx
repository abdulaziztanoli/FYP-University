"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useConversations } from "@/hooks/use-conversations";
import { ConversationList } from "@/components/chat/conversation-list";
import { MessageThread } from "@/components/chat/message-thread";

/**
 * Two-pane inbox shared by both roles. The selected thread lives in the `c`
 * query param so a "Message" button elsewhere can deep-link straight into it.
 */
export function ChatWorkspace({ role }: { role: "company" | "student" }) {
  const router = useRouter();
  const params = useSearchParams();
  const selectedId = params.get("c");
  const selfId = String(useAuthStore((s) => s.user?._id) ?? "");

  const { conversations, isLoading, refresh } = useConversations();

  const selected = conversations.find((c) => c._id === selectedId) ?? null;

  const select = React.useCallback(
    (id: string) => {
      router.replace(`?c=${id}`, { scroll: false });
    },
    [router]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-muted-foreground text-sm">
          {role === "company"
            ? "Talk to students who applied to your roles."
            : "Talk to companies you have applied to."}
        </p>
      </div>

      <div className="grid min-h-0 gap-4 lg:grid-cols-[320px_1fr]">
        <div
          className={cn(
            "min-h-0 rounded-xl border bg-card",
            // On mobile the list hides once a thread is open.
            selectedId ? "hidden lg:block" : "block"
          )}
        >
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            selectedId={selectedId}
            onSelect={select}
            role={role}
          />
        </div>

        <div
          className={cn(
            "min-h-0 rounded-xl border bg-card",
            selectedId ? "block" : "hidden lg:block"
          )}
        >
          {selectedId ? (
            <MessageThread
              key={selectedId}
              conversationId={selectedId}
              selfId={selfId}
              unread={selected?.unread ?? 0}
              onBack={() => router.replace("?", { scroll: false })}
              onActivity={refresh}
            />
          ) : (
            <EmptyState hasAny={conversations.length > 0} />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="bg-muted flex size-12 items-center justify-center rounded-full">
        <MessagesSquare
          className="text-muted-foreground size-6"
          aria-hidden
        />
      </div>
      <p className="text-sm font-medium">
        {hasAny ? "Select a conversation" : "No conversations yet"}
      </p>
      <p className="text-muted-foreground max-w-xs text-sm">
        {hasAny
          ? "Pick a thread on the left to read and reply."
          : "Chats open automatically once an application connects a company and a student."}
      </p>
    </div>
  );
}
