import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export function useQueueSummary() {
  return useQuery({
    queryKey: ["dashboard", "queue-summary"],
    queryFn: async () => {
      const [countRes, newestRes, oldestRes] = await Promise.all([
        supabase
          .from("flood_reports")
          .select("id", { count: "exact", head: true })
          .eq("stage", "awaiting_hitl")
          .eq("status", "submitted"),
        supabase
          .from("flood_reports")
          .select("id, created_at")
          .eq("stage", "awaiting_hitl")
          .eq("status", "submitted")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("flood_reports")
          .select("id, created_at")
          .eq("stage", "awaiting_hitl")
          .eq("status", "submitted")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      if (countRes.error) throw countRes.error;
      if (newestRes.error) throw newestRes.error;
      if (oldestRes.error) throw oldestRes.error;

      return {
        total: countRes.count ?? 0,
        newest: newestRes.data?.created_at ?? null,
        oldest: oldestRes.data?.created_at ?? null,
      };
    },
  });
}
