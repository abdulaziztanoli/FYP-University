"use client";

import { create } from "zustand";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: "student" | "company" | "admin";
  status: string;
  studentProfile?: Record<string, unknown>;
  companyProfile?: Record<string, unknown>;
  createdAt?: string;
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
  hydrateUser: () => Promise<void>;
  logout: () => Promise<void>;
  updateLocalUser: (partial: Partial<AuthUser>) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),

  clearUser: () => set({ user: null, isLoading: false }),

  updateLocalUser: (partial) => {
    const cur = get().user;
    if (!cur) return;
    set({ user: { ...cur, ...partial } });
  },

  hydrateUser: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = (await res.json()) as { user: AuthUser | null };
      set({ user: data.user ?? null, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      set({ user: null, isLoading: false });
    }
  },
}));
