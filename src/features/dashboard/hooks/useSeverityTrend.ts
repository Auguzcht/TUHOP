import { useQuery } from "@tanstack/react-query";

import type { Tables } from "@/types/supabase";
import { supabase } from "@/lib/supabase";

type TrendRow = Tables<"v_daily_trend">;

export function useSeverityTrend() {
  return useQuery({
    queryKey: ["dashboard", "severity-trend"],
    queryFn: async (): Promise<TrendRow[]> => {
      const { data, error } = await supabase
        .from("v_daily_trend")
        .select("flood_date, report_count, severity")
        .order("flood_date", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}
