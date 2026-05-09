import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export function useRecentAlerts() {
  return useQuery({
    queryKey: ["dashboard", "recent-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flood_reports")
        .select(
          "id, post_id, created_at, model_severity, street_address, barangay:barangays(name, districts(name)), author:users_profile!flood_reports_author_id_fkey(full_name)"
        )
        .eq("stage", "awaiting_hitl")
        .eq("status", "submitted")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      const items = (data ?? []).map((row) => ({
        id: row.id,
        postId: row.post_id,
        createdAt: row.created_at,
        severity: row.model_severity,
        streetAddress: row.street_address,
        barangay: row.barangay?.name ?? null,
        district: row.barangay?.districts?.name ?? null,
        authorName: row.author?.full_name ?? null,
      }));

      return { items };
    },
  });
}
