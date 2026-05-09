import { useCallback, useState } from "react";

import { useAuthContext } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

type ProfileError = string | null;

/**
 * Profile fetch utility.
 *
 * Profile is automatically fetched by AuthProvider on auth state changes.
 * This hook is for MANUAL refetch when you need fresh profile data
 * (e.g., after admin updates the user's status/role).
 *
 * Reads userId from AuthContext, writes profile to zustand store.
 */
export function useProfile() {
  const { profile, setProfile } = useAuthStore();
  const { session } = useAuthContext();
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

    try {
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch profile";
      setError(msg);
      setProfile(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, setProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
