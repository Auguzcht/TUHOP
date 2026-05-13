import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { Tables } from "@/types/supabase";
import { supabase } from "@/lib/supabase";

type QueueRow = Tables<"v_validation_queue">;

type ValidationQueueFilters = {
  severity: "all" | "low" | "moderate" | "high";
  districts: string[];
  search: string;
  page?: number;
  pageSize?: number;
};


export function useValidationQueue(filters: ValidationQueueFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useQuery({
    queryKey: ["hitl", "queue", filters, page],
    queryFn: async () => {
      // ── 1. Fetch paginated queue data from the view ──
      let queueQuery = supabase
        .from("v_validation_queue")
        .select("*", { count: "exact" });

      if (filters.severity !== "all") {
        queueQuery = queueQuery.eq("model_severity", filters.severity);
      }
      if (filters.districts.length > 0) {
        queueQuery = queueQuery.in("district_name", filters.districts);
      }
      if (filters.search.trim()) {
        const term = `%${filters.search.trim()}%`;
        queueQuery = queueQuery.or(
          `post_id.ilike.${term},street_address.ilike.${term},barangay_name.ilike.${term},district_name.ilike.${term}`
        );
      }

      const { data, error, count } = await queueQuery
        .order("model_severity", { ascending: false })
        .order("created_at", { ascending: true })
        .range(from, to);

      if (error) throw error;

      const rows = (data ?? []) as QueueRow[];
      const totalCount = count ?? 0;

      // ── 2. Fetch severity totals from the full dataset (ignoring pagination) ──
      // Run 3 count queries in parallel — one per severity level.
      // This gives accurate totals regardless of which page we're on.
      const severityLevels = ["low", "moderate", "high"] as const;
      const severityQueries = severityLevels.map((sev) => {
        const q = supabase
          .from("flood_reports")
          .select("id", { count: "exact", head: true })
          .eq("model_severity", sev)
          .in("stage", ["awaiting_hitl"])
          .in("status", ["submitted"]);

        // District filtering on severity counts is not applied here —
        // it would require a join with barangays. Totals are approximate.
        return q;
      });

      // Also get total count matching filters (for the denominator)
      let totalQ = supabase
        .from("flood_reports")
        .select("id", { count: "exact", head: true })
        .in("stage", ["awaiting_hitl"])
        .in("status", ["submitted"]);

      // Apply severity filter if active
      if (filters.severity !== "all") {
        totalQ = totalQ.eq("model_severity", filters.severity);

        // If severity is filtered, only fetch that single severity's count
        const { count: sevCount } = await totalQ;
        const totals = {
          total: sevCount ?? 0,
          low: filters.severity === "low" ? (sevCount ?? 0) : 0,
          moderate: filters.severity === "moderate" ? (sevCount ?? 0) : 0,
          high: filters.severity === "high" ? (sevCount ?? 0) : 0,
        };

        return {
          reports: rows,
          totals,
          totalCount,
          page,
          pageCount: Math.max(1, Math.ceil(totalCount / pageSize)),
        };
      }

      // Fetch all three severity counts in parallel
      const [lowRes, modRes, highRes] = await Promise.all(severityQueries.map((q) => q));

      const totals = {
        total: totalCount,
        low: lowRes.count ?? 0,
        moderate: modRes.count ?? 0,
        high: highRes.count ?? 0,
      };

      return {
        reports: rows,
        totals,
        totalCount,
        page,
        pageCount: Math.max(1, Math.ceil(totalCount / pageSize)),
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 60_000,
    refetchOnMount: true,
  });
}
