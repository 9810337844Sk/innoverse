import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DashboardTheme = "normal" | "dark" | "green";

interface ThemeState {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "normal",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "photofly-theme", skipHydration: true }
  )
);
