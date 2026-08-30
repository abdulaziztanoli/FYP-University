"use client";

import * as React from "react";
import { pollIntervalFor } from "@/lib/chat-poll";

export type ChatMessage = {
  _id: string;
  sender: string;
  body: string;
  createdAt: string;
  /** Present only on optimistic bubbles that have not been confirmed yet. */
  pending?: boolean;
  failed?: boolean;
  clientId?: string;
};

export type ChatPeer = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  subtitle: string;
};

type Status = "loading" | "ready" | "error";

/**
 * Cursor-based adaptive polling for one conversation.
 *
 * Four things keep this cheap:
 *  1. Every poll after the first sends `?after=<lastMessageId>`, so the steady
 *     state response is an empty array rather than the whole thread.
 *  2. The interval widens as the thread goes quiet (2s → 15s) and snaps back to
 *     2s the moment either side sends something.
 *  3. Polling stops entirely while the tab is hidden, and fires once
 *     immediately on return instead of waiting out the timer.
 *  4. Requests are serial — the next tick is scheduled only after the previous
 *     response lands, so a slow network can never pile up overlapping fetches.
 */
export function useChatMessages(conversationId: string | null) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [peer, setPeer] = React.useState<ChatPeer | null>(null);
  const [status, setStatus] = React.useState<Status>("loading");

  const cursorRef = React.useRef<string | null>(null);
  const lastActivityRef = React.useRef<number | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  // Guards against a late response from a conversation the user already left.
  const runIdRef = React.useRef(0);
  // Lets `send` re-enter the poll loop that lives inside the effect below.
  const tickRef = React.useRef<(() => void) | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** Merge a delta, dropping anything already present and any resolved optimistic twin. */
  const applyDelta = React.useCallback((incoming: ChatMessage[]) => {
    if (incoming.length === 0) return;
    lastActivityRef.current = Date.now();
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m._id));
      const fresh = incoming.filter((m) => !seen.has(m._id));
      if (fresh.length === 0) return prev;
      // Confirmed server copies supersede optimistic bubbles with the same text.
      const bodies = new Set(fresh.map((m) => `${m.sender}:${m.body}`));
      const kept = prev.filter(
        (m) => !m.pending || !bodies.has(`${m.sender}:${m.body}`)
      );
      return [...kept, ...fresh];
    });
  }, []);

  // Switching threads wipes the view synchronously, during render rather than
  // in an effect — otherwise the previous conversation's messages paint for one
  // frame under the new thread's header.
  const [renderedFor, setRenderedFor] = React.useState(conversationId);
  if (renderedFor !== conversationId) {
    setRenderedFor(conversationId);
    setMessages([]);
    setPeer(null);
    setStatus(conversationId ? "loading" : "ready");
  }

  React.useEffect(() => {
    if (!conversationId) return;

    // Cursor state belongs to one thread — reset it before the loop starts.
    cursorRef.current = null;
    lastActivityRef.current = null;

    const runId = ++runIdRef.current;
    let cancelled = false;

    async function tick() {
      if (cancelled || runId !== runIdRef.current) return;

      // Nothing to do while the tab is in the background — the visibility
      // listener below restarts the loop the moment it comes back.
      if (document.visibilityState === "hidden") return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const cursor = cursorRef.current;
      const qs = new URLSearchParams();
      if (cursor) qs.set("after", cursor);
      else qs.set("peer", "1");

      try {
        const res = await fetch(
          `/api/chat/conversations/${conversationId}/messages?${qs}`,
          { credentials: "include", signal: controller.signal }
        );
        if (cancelled || runId !== runIdRef.current) return;
        if (!res.ok) throw new Error(String(res.status));

        const data = (await res.json()) as {
          messages: ChatMessage[];
          cursor: string | null;
          peer?: ChatPeer;
          lastMessageAt: string | null;
        };
        if (cancelled || runId !== runIdRef.current) return;

        if (data.peer) setPeer(data.peer);
        if (data.cursor) cursorRef.current = data.cursor;
        if (!cursor) {
          setMessages(data.messages);
          lastActivityRef.current = data.lastMessageAt
            ? new Date(data.lastMessageAt).getTime()
            : null;
        } else {
          applyDelta(data.messages);
        }
        setStatus("ready");
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
        if (cancelled || runId !== runIdRef.current) return;
        // Keep whatever is on screen and try again on the next tick.
        setStatus((s) => (s === "loading" ? "error" : s));
      } finally {
        if (!cancelled && runId === runIdRef.current) {
          clearTimer();
          timerRef.current = setTimeout(
            tick,
            pollIntervalFor(lastActivityRef.current)
          );
        }
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible") {
        clearTimer();
        void tick();
      }
    }

    tickRef.current = () => void tick();
    void tick();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      tickRef.current = null;
      clearTimer();
      abortRef.current?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [conversationId, applyDelta, clearTimer]);

  /** Optimistic send — the bubble appears instantly, then reconciles. */
  const send = React.useCallback(
    async (body: string, selfId: string) => {
      if (!conversationId) return false;
      const text = body.trim();
      if (!text) return false;

      const clientId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimistic: ChatMessage = {
        _id: clientId,
        clientId,
        sender: selfId,
        body: text,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);
      lastActivityRef.current = Date.now();

      try {
        const res = await fetch(
          `/api/chat/conversations/${conversationId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ body: text, clientId }),
          }
        );
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { message: ChatMessage };

        setMessages((prev) =>
          prev.map((m) => (m._id === clientId ? data.message : m))
        );
        // Advance past our own message so the next poll doesn't re-fetch it.
        // Hex ObjectIds of equal length compare correctly as strings.
        if (!cursorRef.current || data.message._id > cursorRef.current) {
          cursorRef.current = data.message._id;
        }
        // Sending counts as activity, so restart the loop on the fast tier
        // instead of waiting out whatever interval was already pending.
        clearTimer();
        tickRef.current?.();
        return true;
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === clientId ? { ...m, pending: false, failed: true } : m
          )
        );
        return false;
      }
    },
    [conversationId, clearTimer]
  );

  /** Drop a bubble that failed to send. */
  const dismissFailed = React.useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== id));
  }, []);

  return { messages, peer, status, send, dismissFailed };
}
