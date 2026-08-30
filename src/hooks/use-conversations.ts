"use client";

import useSWR from "swr";
import { swrFetcher } from "@/lib/swr-fetcher";
import { pollIntervalFor } from "@/lib/chat-poll";
import type { ChatPeer } from "@/hooks/use-chat-messages";

export type ConversationRow = {
  _id: string;
  peer: ChatPeer | null;
  lastMessageBody: string;
  lastMessageSender: string | null;
  lastMessageAt: string | null;
  unread: number;
};

type Payload = {
  conversations: ConversationRow[];
  totalUnread: number;
  latestActivityAt: string | null;
};

/**
 * Inbox list with the same adaptive cadence as the message stream.
 *
 * SWR already skips refreshes while the tab is hidden and revalidates on focus,
 * so the only thing to add is an interval that widens when the inbox is quiet.
 */
export function useConversations() {
  const { data, error, isLoading, mutate } = useSWR<Payload>(
    "/api/chat/conversations",
    swrFetcher,
    {
      refreshInterval: (latest) =>
        pollIntervalFor(
          latest?.latestActivityAt
            ? new Date(latest.latestActivityAt).getTime()
            : null
        ),
      revalidateOnFocus: true,
      keepPreviousData: true,
      dedupingInterval: 1000,
    }
  );

  return {
    conversations: data?.conversations ?? [],
    totalUnread: data?.totalUnread ?? 0,
    isLoading: isLoading && !data,
    error,
    refresh: mutate,
  };
}
