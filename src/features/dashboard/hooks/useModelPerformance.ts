import { useQuery } from "@tanstack/react-query";

import type { Tables } from "@/types/supabase";
import { supabase } from "@/lib/supabase";

type ModelPerformanceRow = Tables<"v_model_performance">;

export function useModelPerformance() {
  return useQuery({
    queryKey: ["dashboard", "model-performance"],
    queryFn: async (): Promise<ModelPerformanceRow[]> => {
      const { data, error } = await supabase.from("v_model_performance").select("*");

      if (error) throw error;
      return data ?? [];
    },
  });
}
