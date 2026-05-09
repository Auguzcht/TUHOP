import { useQuery } from "@tanstack/react-query";

import type { Tables } from "@/types/supabase";
import { supabase } from "@/lib/supabase";

type DistrictSeverityRow = Tables<"v_district_severity">;

export function useDistrictSeverity() {
  return useQuery({
    queryKey: ["dashboard", "district-severity"],
    queryFn: async (): Promise<DistrictSeverityRow[]> => {
      const { data, error } = await supabase
        .from("v_district_severity")
        .select("district_name, report_count, severity");

      if (error) throw error;
      return data ?? [];
    },
  });
}
