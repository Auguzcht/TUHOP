import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

type ValidatePayload = {
  reportId: string;
  humanSeverity: "low" | "moderate" | "high";
  rationale: string;
};

export function useValidateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ValidatePayload) => {
      const { data, error } = await supabase.functions.invoke("validate-report", {
        body: payload,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hitl", "queue"] });
      queryClient.invalidateQueries({ queryKey: ["hitl", "report", variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ["hitl", "daily-progress"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
