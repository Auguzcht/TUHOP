import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

type ProfileError = string | null;

export function useProfile() {
	const { session, profile, setProfile } = useAuthStore();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<ProfileError>(null);

	const fetchProfile = useCallback(async () => {
		const userId = session?.user?.id;
		if (!userId) {
			setProfile(null);
			return null;
		}

		setIsLoading(true);
		setError(null);

		const { data, error: profileError } = await supabase
			.from("users_profile")
			.select("*, barangays(name, districts(name))")
			.eq("id", userId)
			.single();

		if (profileError) {
			setError(profileError.message);
			setProfile(null);
			setIsLoading(false);
			return null;
		}

		setProfile(data);
		setIsLoading(false);
		return data;
	}, [session?.user?.id, setProfile]);

	useEffect(() => {
		void fetchProfile();
	}, [fetchProfile]);

	return {
		profile,
		isLoading,
		error,
		refetch: fetchProfile,
	};
}
