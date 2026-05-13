import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

type TopBarangay = {
  barangay_name: string;
  district_name: string;
  report_count: number;
};

export function useTopBarangays() {
  return useQuery({
    queryKey: ["dashboard", "top-barangays"],
    queryFn: async (): Promise<TopBarangay[]> => {
      const { data, error } = await supabase
        .from("flood_reports")
        .select(
          "barangay:barangays!inner(name, district:districts!inner(name))",
          { count: "exact" }
        )
        .not("barangay_id", "is", null);

      if (error) throw error;

      // Aggregate in JS since Supabase doesn't support GROUP BY with joins in all cases
      const counts: Record<string, { count: number; district: string }> = {};
      for (const row of data ?? []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const name = (row as any).barangay?.name ?? "Unknown";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const district = (row as any).barangay?.district?.name ?? "Unknown";
        if (!counts[name]) counts[name] = { count: 0, district };
        counts[name].count++;
      }

      return Object.entries(counts)
        .map(([name, info]) => ({
          barangay_name: name,
          district_name: info.district,
          report_count: info.count,
        }))
        .sort((a, b) => b.report_count - a.report_count)
        .slice(0, 5);
    },
    staleTime: 60_000,
  });
}
