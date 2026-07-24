"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  signInModalOpen: boolean;
  theme: "light" | "dark";
  sidebarOpen: boolean;
  activePanel: string;
  openSignInModal: () => void;
  closeSignInModal: () => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActivePanel: (panel: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      signInModalOpen: false,
      theme: "dark",
      sidebarOpen: true,
      activePanel: "command",
      openSignInModal: () => set({ signInModalOpen: true }),
      closeSignInModal: () => set({ signInModalOpen: false }),
      setTheme: (theme) => {
        if (typeof document !== "undefined") {
          document.body.dataset.theme = theme;
        }
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === "dark" ? "light" : "dark";
          if (typeof document !== "undefined") {
            document.body.dataset.theme = nextTheme;
          }
          return { theme: nextTheme };
        }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActivePanel: (panel) => set({ activePanel: panel }),
    }),
    {
      name: "aniverse_ui_store",
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
