"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Opens (or reuses) the thread with `peerId` and deep-links into the inbox.
 * Rendered wherever an application already connects the two sides.
 */
export function MessageButton({
  peerId,
  role,
  label = "Message",
  variant = "outline",
  size = "sm",
  className,
}: {
  peerId: string;
  role: "company" | "student";
  label?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function open() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ peerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not open the conversation.");
        return;
      }
      router.push(`/${role}/messages?c=${data.conversationId}`);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      loading={loading}
      onClick={() => void open()}
    >
      <MessageSquare className="size-4" />
      {label}
    </Button>
  );
}
