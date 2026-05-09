import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

type UserStatus = "pending_review" | "active" | "rejected" | "deactivated";

export function useUsersByStatus(status: UserStatus, search = "") {
  return useQuery({
    queryKey: ["admin", "users", status, search],
    queryFn: async () => {
      let query = supabase
        .from("users_profile")
        .select(
          "id, full_name, email, role, status, approved_at, created_at, barangay:barangays(name, districts(name))"
        )
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`full_name.ilike.${term},email.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data ?? [];
    },
  });
}
