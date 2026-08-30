"use client";

import { useConversations } from "@/hooks/use-conversations";

/**
 * Live unread pill for the sidebar.
 *
 * Shares SWR's `/api/chat/conversations` cache entry with the inbox, so having
 * this mounted on every dashboard page costs no extra requests — on the
 * messages page the two consumers dedupe onto a single poll.
 */
export function UnreadBadge() {
  const { totalUnread } = useConversations();
  if (totalUnread <= 0) return null;

  return (
    <span
      className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold"
      aria-label={`${totalUnread} unread messages`}
    >
      {totalUnread > 99 ? "99+" : totalUnread}
    </span>
  );
}
