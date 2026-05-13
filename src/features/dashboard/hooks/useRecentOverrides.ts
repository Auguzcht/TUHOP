import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

type RecentOverride = {
  id: string;
  postId: string;
  barangayName: string | null;
  districtName: string | null;
  modelSeverity: string | null;
  humanSeverity: string | null;
  validatedAt: string | null;
};

export function useRecentOverrides() {
  return useQuery({
    queryKey: ["dashboard", "recent-overrides"],
    queryFn: async (): Promise<RecentOverride[]> => {
      const { data, error } = await supabase
        .from("flood_reports")
        .select(
          "id, post_id, model_severity, human_severity, validated_at, barangay:barangays(name, districts(name))"
        )
        .eq("status", "validated")
        .not("human_severity", "is", null)
        .not("model_severity", "is", null)
        .order("validated_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data ?? []).map((row) => ({
        id: row.id,
        postId: row.post_id,
        barangayName: (row as any).barangay?.name ?? null,
        districtName: (row as any).barangay?.districts?.name ?? null,
        modelSeverity: row.model_severity,
        humanSeverity: row.human_severity,
        validatedAt: row.validated_at,
      }));
    },
    staleTime: 30_000,
  });
}
