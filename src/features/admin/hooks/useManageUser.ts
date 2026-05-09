import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

type ManageUserPayload = {
  userId: string;
  action: "approve" | "reject" | "deactivate" | "activate";
  role?: "barangay_official" | "hitl_validator" | "admin";
};

export function useManageUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ManageUserPayload) => {
      const { data, error } = await supabase.functions.invoke("manage-user", {
        body: payload,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "barangay-directory"] });
    },
  });
}
