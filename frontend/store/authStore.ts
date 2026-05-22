import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

type User = { _id: string; name: string; email: string; role: string };

interface AuthState {
  user: User | null;
  token: string | null;
  _hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      _hasHydrated: false,
      setAuth: (user, token) => {
        const secure = typeof window !== "undefined" && window.location.protocol === "https:";
        Cookies.set("token", token, { expires: 7, secure, sameSite: "lax" });
        set({ user, token });
      },
      logout: () => {
        Cookies.remove("token");
        set({ user: null, token: null });
      },
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
