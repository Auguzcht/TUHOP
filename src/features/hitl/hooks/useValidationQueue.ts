import { useQuery } from "@tanstack/react-query";

import type { Tables } from "@/types/supabase";
import { supabase } from "@/lib/supabase";

type QueueRow = Tables<"v_validation_queue">;

type ValidationQueueFilters = {
  severity: "all" | "low" | "moderate" | "high";
  districts: string[];
  search: string;
};

export function useValidationQueue(filters: ValidationQueueFilters) {
  return useQuery({
    queryKey: ["hitl", "queue", filters],
    queryFn: async () => {
      let query = supabase.from("v_validation_queue").select("*");

      if (filters.severity !== "all") {
        query = query.eq("model_severity", filters.severity);
      }

      if (filters.districts.length > 0) {
        query = query.in("district_name", filters.districts);
      }

      if (filters.search.trim()) {
        const term = `%${filters.search.trim()}%`;
        query = query.or(
          `post_id.ilike.${term},street_address.ilike.${term},barangay_name.ilike.${term},district_name.ilike.${term}`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as QueueRow[];
      const totals = rows.reduce(
        (acc, row) => {
          if (row.model_severity) {
            acc[row.model_severity] += 1;
          }
          acc.total += 1;
          return acc;
        },
        { total: 0, low: 0, moderate: 0, high: 0 }
      );

      return { reports: rows, totals };
    },
  });
}
