"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/src/context/AuthContext";

interface AuthStoreState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "aniverse_auth_user",
    },
  ),
);
