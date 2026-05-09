import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export function useVerificationLog() {
  return useQuery({
    queryKey: ["audit", "verification-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flood_reports")
        .select(
          "id, post_id, validated_at, model_severity, human_severity, validation_rationale, barangay:barangays(name, districts(name)), validator:users_profile!flood_reports_validator_id_fkey(full_name)"
        )
        .eq("status", "validated")
        .order("validated_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return data ?? [];
    },
  });
}
