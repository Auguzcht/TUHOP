import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export function usePerSeverityPrecision() {
  return useQuery({
    queryKey: ["audit", "per-severity-precision"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flood_reports")
        .select("model_severity, human_severity")
        .eq("status", "validated");

      if (error) throw error;

      const totals = { low: 0, moderate: 0, high: 0 };
      const confirmed = { low: 0, moderate: 0, high: 0 };

      for (const row of data ?? []) {
        if (!row.model_severity) continue;
        totals[row.model_severity] += 1;
        if (row.human_severity && row.human_severity === row.model_severity) {
          confirmed[row.model_severity] += 1;
        }
      }

      return {
        totals,
        confirmed,
        precision: {
          low: totals.low ? confirmed.low / totals.low : 0,
          moderate: totals.moderate ? confirmed.moderate / totals.moderate : 0,
          high: totals.high ? confirmed.high / totals.high : 0,
        },
      };
    },
  });
}
