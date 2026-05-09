import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export function useReportDetail(reportId: string | undefined) {
  return useQuery({
    queryKey: ["hitl", "report", reportId],
    enabled: Boolean(reportId),
    queryFn: async () => {
      if (!reportId) {
        return { report: null, images: [] };
      }

      const [reportRes, imagesRes] = await Promise.all([
        supabase
          .from("flood_reports")
          .select(
            "*, barangay:barangays(name, districts(name)), author:users_profile!flood_reports_author_id_fkey(full_name, avatar_url), validator:users_profile!flood_reports_validator_id_fkey(full_name)"
          )
          .eq("id", reportId)
          .maybeSingle(),
        supabase
          .from("flood_images")
          .select("id, image_url, display_order, created_at")
          .eq("report_id", reportId)
          .order("display_order", { ascending: true }),
      ]);

      if (reportRes.error) throw reportRes.error;
      if (imagesRes.error) throw imagesRes.error;

      return {
        report: reportRes.data ?? null,
        images: imagesRes.data ?? [],
      };
    },
  });
}
