"use client";

import * as React from "react";
import { ArrowLeft, RotateCcw, Send, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDayLabel, formatMessageTime } from "@/lib/chat-format";
import {
  useChatMessages,
  type ChatMessage,
} from "@/hooks/use-chat-messages";

export function MessageThread({
  conversationId,
  selfId,
  unread,
  onBack,
  onActivity,
}: {
  conversationId: string;
  selfId: string;
  unread: number;
  onBack: () => void;
  onActivity: () => void;
}) {
  const { messages, peer, status, send, dismissFailed } =
    useChatMessages(conversationId);
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  // Only auto-scroll when the reader is already at the bottom, so arriving
  // messages never yank them away from older text they are reading.
  const pinnedRef = React.useRef(true);

  const onScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    pinnedRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  React.useEffect(() => {
    if (pinnedRef.current) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages]);

  // Clear the unread badge once the thread is actually on screen.
  React.useEffect(() => {
    if (unread <= 0) return;
    let cancelled = false;
    void fetch(`/api/chat/conversations/${conversationId}/read`, {
      method: "POST",
      credentials: "include",
    })
      .then(() => {
        if (!cancelled) onActivity();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [conversationId, unread, onActivity]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    pinnedRef.current = true;
    const ok = await send(text, selfId);
    setSending(false);
    if (ok) onActivity();
  }

  const initials =
    peer?.name?.slice(0, 2).toUpperCase() ??
    peer?.email?.slice(0, 2).toUpperCase() ??
    "?";

  return (
    <div className="flex h-[60vh] flex-col lg:h-[70vh]">
      {/* Peer header */}
      <div className="flex shrink-0 items-center gap-3 border-b px-3 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Avatar className="size-9 shrink-0">
          <AvatarImage src={peer?.avatar || undefined} alt="" />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          {peer ? (
            <>
              <p className="truncate text-sm font-semibold">{peer.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {peer.subtitle || peer.email}
              </p>
            </>
          ) : (
            <Skeleton className="h-4 w-32" />
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4"
      >
        {status === "loading" && messages.length === 0 ? (
          <ThreadSkeleton />
        ) : messages.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No messages yet — say hello.
          </p>
        ) : (
          messages.map((m, i) => (
            <MessageRow
              key={m._id}
              message={m}
              previous={messages[i - 1]}
              isSelf={m.sender === selfId}
              onDismiss={dismissFailed}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t p-3">
        <div className="flex items-end gap-2">
          <Textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends; Shift+Enter makes a new line.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Write a message…"
            maxLength={4000}
            className="max-h-32 min-h-10 resize-none"
          />
          <Button
            size="icon"
            className="size-10 shrink-0"
            disabled={!draft.trim() || sending}
            onClick={() => void handleSend()}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageRow({
  message,
  previous,
  isSelf,
  onDismiss,
}: {
  message: ChatMessage;
  previous?: ChatMessage;
  isSelf: boolean;
  onDismiss: (id: string) => void;
}) {
  const showDay =
    !previous ||
    new Date(previous.createdAt).toDateString() !==
      new Date(message.createdAt).toDateString();

  return (
    <>
      {showDay && (
        <div className="flex items-center justify-center py-3">
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-[11px] font-medium">
            {formatDayLabel(message.createdAt)}
          </span>
        </div>
      )}
      <div className={cn("flex", isSelf ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm break-words",
            isSelf
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted rounded-bl-sm",
            message.pending && "opacity-60",
            message.failed && "ring-destructive/50 ring-2"
          )}
        >
          <p className="whitespace-pre-wrap">{message.body}</p>
          <div
            className={cn(
              "mt-1 flex items-center gap-1.5 text-[10px]",
              isSelf ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {message.failed ? (
              <>
                <span className="text-destructive font-medium">Not sent</span>
                <button
                  type="button"
                  onClick={() => onDismiss(message._id)}
                  className="hover:text-destructive cursor-pointer"
                  aria-label="Dismiss failed message"
                >
                  <X className="size-3" />
                </button>
              </>
            ) : message.pending ? (
              <>
                <RotateCcw className="size-2.5 animate-spin" aria-hidden />
                <span>Sending…</span>
              </>
            ) : (
              <span>{formatMessageTime(message.createdAt)}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ThreadSkeleton() {
  return (
    <div className="space-y-3 py-2">
      {[
        { self: false, w: "w-40" },
        { self: true, w: "w-52" },
        { self: false, w: "w-32" },
      ].map((s, i) => (
        <div
          key={i}
          className={cn("flex", s.self ? "justify-end" : "justify-start")}
        >
          <Skeleton className={cn("h-10 rounded-2xl", s.w)} />
        </div>
      ))}
    </div>
  );
}
