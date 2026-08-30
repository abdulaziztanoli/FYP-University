"use client";

import * as React from "react";
import { ChatWorkspace } from "@/components/chat/chat-workspace";

export default function StudentMessagesPage() {
  return (
    <React.Suspense fallback={null}>
      <ChatWorkspace role="student" />
    </React.Suspense>
  );
}
