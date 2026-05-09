import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export function useBarangayDirectory() {
  return useQuery({
    queryKey: ["admin", "barangay-directory"],
    queryFn: async () => {
      const [barangayRes, usersRes, reportsRes] = await Promise.all([
        supabase
          .from("barangays")
          .select("id, name, district:districts(name)")
          .order("name", { ascending: true }),
        supabase
          .from("users_profile")
          .select("barangay_id")
          .eq("status", "active"),
        supabase.from("flood_reports").select("barangay_id"),
      ]);

      if (barangayRes.error) throw barangayRes.error;
      if (usersRes.error) throw usersRes.error;
      if (reportsRes.error) throw reportsRes.error;

      const userCounts = (usersRes.data ?? []).reduce((acc, row) => {
        if (!row.barangay_id) return acc;
        acc[row.barangay_id] = (acc[row.barangay_id] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const reportCounts = (reportsRes.data ?? []).reduce((acc, row) => {
        if (!row.barangay_id) return acc;
        acc[row.barangay_id] = (acc[row.barangay_id] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const rows = (barangayRes.data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        district: row.district?.name ?? null,
        activeUsers: userCounts[row.id] ?? 0,
        reportCount: reportCounts[row.id] ?? 0,
      }));

      return rows;
    },
  });
}
