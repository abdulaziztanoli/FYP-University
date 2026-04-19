"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function AuthHydration() {
  const hydrateUser = useAuthStore((s) => s.hydrateUser);

  useEffect(() => {
    void hydrateUser();
  }, [hydrateUser]);

  return null;
}
