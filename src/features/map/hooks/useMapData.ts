import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { parseWKBPoint } from "@/lib/wkb";

export type MapReport = {
  id: string;
  postId: string;
  authorName: string;
  humanSeverity: "low" | "moderate" | "high";
  postContent: string;
  streetAddress: string | null;
  barangayName: string;
  districtName: string | null;
  position: [number, number];
  validatedAt: string;
};

export type MapData = {
  reports: MapReport[];
  severityCounts: { low: number; moderate: number; high: number };
  totalInRange: number;
};

/** Reports filtered by selected date range */
export function useMapData(startDate: string, endDate: string) {
  return useQuery<MapData>({
    queryKey: ["map", "validated-data", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flood_reports")
        .select(
          `id, post_id, human_severity, post_content, street_address, validated_at, author:users_profile!author_id(full_name), barangay:barangays!inner(name, centroid, district:districts(name))`,
        )
        .eq("status", "validated")
        .not("human_severity", "is", null)
        .gte("validated_at", startDate)
        .lte("validated_at", `${endDate}T23:59:59`);

      if (error) {
        console.warn("[map] useMapData error:", error);
        throw error;
      }

      const reports: MapReport[] = (data ?? []).map((r) => {
        const b = r.barangay as {
          name: string;
          centroid: string;
          district: { name: string } | null;
        };
        const a = r.author as { full_name: string };
        return {
          id: r.id,
          postId: r.post_id ?? "",
          authorName: a?.full_name ?? "Unknown",
          humanSeverity: r.human_severity as "low" | "moderate" | "high",
          postContent: r.post_content ?? "",
          streetAddress: r.street_address,
          barangayName: b.name,
          districtName: b.district?.name ?? null,
          position: parseWKBPoint(b.centroid) ?? [7.0633, 125.608],
          validatedAt: r.validated_at ?? "",
        };
      });

      return {
        reports,
        severityCounts: {
          low: reports.filter((r) => r.humanSeverity === "low").length,
          moderate: reports.filter((r) => r.humanSeverity === "moderate").length,
          high: reports.filter((r) => r.humanSeverity === "high").length,
        },
        totalInRange: reports.length,
      };
    },
    staleTime: 0,
    gcTime: 120_000,
    refetchOnMount: true,
  });
}

/** Latest validated reports from the last 7 days (for Recent Reports sidebar) */
export function useRecentReports() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return useQuery<MapReport[]>({
    queryKey: ["map", "recent-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flood_reports")
        .select(
          `id, post_id, human_severity, post_content, street_address, validated_at, author:users_profile!author_id(full_name), barangay:barangays!inner(name, centroid)`,
        )
        .eq("status", "validated")
        .not("human_severity", "is", null)
        .gte("validated_at", sevenDaysAgo.toISOString().split("T")[0])
        .order("validated_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      return (data ?? []).map((r) => {
        const b = r.barangay as { name: string; centroid: string };
        const a = r.author as { full_name: string };
        return {
          id: r.id,
          postId: r.post_id ?? "",
          authorName: a?.full_name ?? "Unknown",
          humanSeverity: r.human_severity as "low" | "moderate" | "high",
          postContent: r.post_content ?? "",
          streetAddress: r.street_address,
          barangayName: b.name,
          districtName: null,
          position: parseWKBPoint(b.centroid) ?? [7.0633, 125.608],
          validatedAt: r.validated_at ?? "",
        };
      });
    },
    staleTime: 30_000,
  });
}
