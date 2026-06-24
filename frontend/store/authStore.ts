import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  plan?: string;
  avatar?: string | null;
};

interface AuthState {
  user: User | null;
  _hasHydrated: boolean;
  // Accept optional second arg (token) so existing callers don't break,
  // but we rely on the httpOnly cookie set by the server — token ignored here.
  setAuth: (user: User, _token?: string) => void;
  updateUser: (changes: Partial<User>) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,

      setAuth: (user, _token?) => set({ user }),

      updateUser: (changes) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...changes } : null,
        })),

      logout: () => {
        // Clear the server-side httpOnly cookie
        fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
        set({ user: null });
      },

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "auth-storage",
      version: 2,
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
