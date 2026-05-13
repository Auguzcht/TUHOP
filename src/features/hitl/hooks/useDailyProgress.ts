import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

export function useDailyProgress() {
  const profile = useAuthStore((s) => s.profile);

  return useQuery({
    queryKey: ["hitl", "daily-progress"],
    enabled: Boolean(profile?.id),
    queryFn: async () => {
      const userId = profile?.id;
      if (!userId) return { reviewed: 0, total: 0 };

      const today = new Date().toISOString().slice(0, 10);

      // Reports validated by current user today
      const { count: reviewed, error: reviewedErr } = await supabase
        .from("flood_reports")
        .select("id", { count: "exact", head: true })
        .eq("validator_id", userId)
        .gte("validated_at", today);

      if (reviewedErr) throw reviewedErr;

      // Total reports awaiting validation (for context)
      const { count: total, error: totalErr } = await supabase
        .from("flood_reports")
        .select("id", { count: "exact", head: true })
        .in("stage", ["awaiting_hitl"])
        .in("status", ["submitted"]);

      if (totalErr) throw totalErr;

      return {
        reviewed: reviewed ?? 0,
        total: total ?? 0,
      };
    },
    staleTime: 0,
    refetchOnMount: true,
  });
}
