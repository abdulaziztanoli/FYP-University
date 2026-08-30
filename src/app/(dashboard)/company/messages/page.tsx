"use client";

import * as React from "react";
import { ChatWorkspace } from "@/components/chat/chat-workspace";

export default function CompanyMessagesPage() {
  return (
    <React.Suspense fallback={null}>
      <ChatWorkspace role="company" />
    </React.Suspense>
  );
}
