import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

const getToday = () => new Date().toISOString().slice(0, 10);

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const today = getToday();

      const [totalRes, todayRes, validatedRes, overridesRes] = await Promise.all([
        supabase.from("flood_reports").select("id", { count: "exact", head: true }),
        supabase
          .from("flood_reports")
          .select("id", { count: "exact", head: true })
          .eq("flood_date", today),
        supabase
          .from("flood_reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "validated"),
        supabase
          .from("flood_reports")
          .select("model_severity, human_severity")
          .eq("status", "validated"),
      ]);

      if (totalRes.error) throw totalRes.error;
      if (todayRes.error) throw todayRes.error;
      if (validatedRes.error) throw validatedRes.error;
      if (overridesRes.error) throw overridesRes.error;

      const overrides = (overridesRes.data ?? []).filter(
        (row) => row.model_severity && row.human_severity && row.model_severity !== row.human_severity
      ).length;

      return {
        total: totalRes.count ?? 0,
        today: todayRes.count ?? 0,
        verified: validatedRes.count ?? 0,
        overrides,
      };
    },
  });
}
