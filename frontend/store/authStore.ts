import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = { _id: string; name: string; email: string; role: string; avatar?: string | null };

interface AuthState {
  user: User | null;
  _hasHydrated: boolean;
  setAuth: (user: User) => void;
  updateUser: (changes: Partial<User>) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,
      setAuth: (user) => set({ user }),
      updateUser: (changes) => set((state) => ({
        user: state.user ? { ...state.user, ...changes } : null,
      })),
      logout: () => {
        void fetch("/api/auth/logout", { method: "POST" });
        set({ user: null });
      },
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "auth-storage",
      version: 1,
      partialize: (state) => ({ user: state.user }),
      migrate: (persisted) => {
        const saved = persisted as { user?: User | null };
        return { user: saved.user ?? null, _hasHydrated: false };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
