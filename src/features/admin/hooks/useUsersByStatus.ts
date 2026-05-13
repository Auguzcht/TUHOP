import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

type UserStatus = "pending_review" | "active" | "rejected" | "deactivated";

export function useUsersByStatus(status: UserStatus, search = "") {
  return useQuery({
    queryKey: ["admin", "users", status, search],
    staleTime: 30_000,
    gcTime: 120_000,
    queryFn: async () => {
      let query = supabase
        .from("users_profile")
        .select(
          "id, full_name, email, role, status, phone_number, approved_at, created_at, updated_at, barangay:barangays!users_profile_barangay_id_fkey(name, district:districts(name))"
        )
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`full_name.ilike.${term},email.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch approver names for approved/rejected users
      const approvedIds = (data ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((row: any) => row.approved_by)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((row: any) => row.approved_by)
        .filter(Boolean);

      let approverMap: Record<string, string> = {};
      if (approvedIds.length > 0) {
        const { data: approvers } = await supabase
          .from("users_profile")
          .select("id, full_name")
          .in("id", approvedIds);
        if (approvers) {
          approverMap = Object.fromEntries(
            approvers.map((a) => [a.id, a.full_name])
          );
        }
      }

      return (data ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (row: any) => ({
          ...row,
          approver_name: row.approved_by ? (approverMap[row.approved_by] ?? null) : null,
        })
      );
    },
  });
}
