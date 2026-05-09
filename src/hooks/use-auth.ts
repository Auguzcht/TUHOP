import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

type AuthError = string | null;

export function useAuth() {
	const {
		session,
		profile,
		isLoading,
		setSession,
		setProfile,
		setLoading,
		clear,
	} = useAuthStore();
	const [error, setError] = useState<AuthError>(null);

	const fetchProfile = useCallback(
		async (activeSession: Session | null) => {
			const userId = activeSession?.user?.id;
			if (!userId) {
				setProfile(null);
				return null;
			}

			const { data, error: profileError } = await supabase
				.from("users_profile")
				.select("*, barangays(name, districts(name))")
				.eq("id", userId)
				.single();

			if (profileError) {
				setError(profileError.message);
				setProfile(null);
				return null;
			}

			setProfile(data);
			return data;
		},
		[setProfile]
	);

	useEffect(() => {
		let isMounted = true;
		setLoading(true);

		supabase.auth
			.getSession()
			.then(({ data }) => {
				if (!isMounted) return;
				setSession(data.session);
				void fetchProfile(data.session);
			})
			.catch((authError: Error) => {
				if (!isMounted) return;
				setError(authError.message);
			})
			.finally(() => {
				if (!isMounted) return;
				setLoading(false);
			});

		const { data } = supabase.auth.onAuthStateChange((_, nextSession) => {
			setSession(nextSession);
			void fetchProfile(nextSession);
		});

		return () => {
			isMounted = false;
			data.subscription.unsubscribe();
		};
	}, [fetchProfile, setLoading, setSession]);

	const signIn = useCallback(async (email: string, password: string) => {
		setError(null);
		const result = await supabase.auth.signInWithPassword({ email, password });
		if (result.error) {
			setError(result.error.message);
		}
		return result;
	}, []);

	const signUp = useCallback(
		async (email: string, password: string, metadata?: Record<string, string>) => {
			setError(null);
			const result = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: metadata ?? {},
				},
			});
			if (result.error) {
				setError(result.error.message);
			}
			return result;
		},
		[]
	);

	const signOut = useCallback(async () => {
		setError(null);
		const result = await supabase.auth.signOut();
		clear();
		if (result.error) {
			setError(result.error.message);
		}
		return result;
	}, [clear]);

	return {
		session,
		profile,
		isLoading,
		error,
		signIn,
		signUp,
		signOut,
	};
}
