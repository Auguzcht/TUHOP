import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Database } from "@/types/supabase";

type UserProfile = Database["public"]["Tables"]["users_profile"]["Row"];

interface AuthState {
	session: Session | null;
	profile: UserProfile | null;
	isLoading: boolean;
	setSession: (session: Session | null) => void;
	setProfile: (profile: UserProfile | null) => void;
	setLoading: (isLoading: boolean) => void;
	clear: () => void;
	isAdmin: () => boolean;
	isValidator: () => boolean;
	isBarangay: () => boolean;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			session: null,
			profile: null,
			isLoading: true,
			setSession: (session) => set({ session }),
			setProfile: (profile) => set({ profile }),
			setLoading: (isLoading) => set({ isLoading }),
			clear: () => set({ session: null, profile: null, isLoading: false }),
			isAdmin: () => get().profile?.role === "admin",
			isValidator: () => get().profile?.role === "hitl_validator",
			isBarangay: () => get().profile?.role === "barangay_official",
		}),
		{
			name: "tuhop-auth-store",
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				session: state.session,
				profile: state.profile,
			}),
		}
	)
);
