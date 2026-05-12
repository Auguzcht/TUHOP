import { create } from "zustand";

import type { Database } from "@/types/supabase";

type UserProfile = Database["public"]["Tables"]["users_profile"]["Row"];

/**
 * Auth store — minimal profile cache.
 *
 * This is NOT a session store. Session lives in the AuthContext.
 * This store just caches the profile for components (sidebar, topbar)
 * that need profile data without context access.
 *
 * No persist middleware — profile is ephemeral and fetched on every
 * page load via the INITIAL_SESSION event.
 */
interface AuthState {
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  /** True during login/logout transitions — shows TuhopLoader */
  transitioning: boolean;

  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: () => void;
  setTransitioning: (v: boolean) => void;
  clear: () => void;

  isAdmin: () => boolean;
  isValidator: () => boolean;
  isBarangay: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  profile: null,
  isLoading: true,
  isInitialized: false,
  transitioning: false,

  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: () => set({ isInitialized: true, isLoading: false }),
  setTransitioning: (transitioning) => set({ transitioning }),
  clear: () =>
    set({
      profile: null,
      isLoading: false,
      isInitialized: true,
      transitioning: false,
    }),

  isAdmin: () => get().profile?.role === "admin",
  isValidator: () => get().profile?.role === "hitl_validator",
  isBarangay: () => get().profile?.role === "barangay_official",
}));
