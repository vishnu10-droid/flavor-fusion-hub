import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PublicUser } from "@/lib/backend/types";

type AuthState = {
  user: PublicUser | null;
  token: string | null;
  setAuth: (user: PublicUser) => void;
  updateUser: (user: PublicUser) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user) =>
        set({
          user,
          token: `token_${user.id}_${Date.now().toString(36)}`,
        }),
      updateUser: (user) => set((state) => ({ ...state, user })),
      logout: () => set({ user: null, token: null }),
    }),
    { name: "orderx-auth" },
  ),
);
