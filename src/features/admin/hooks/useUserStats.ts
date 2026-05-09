import { startOfMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export function useUserStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const monthStart = startOfMonth(new Date()).toISOString();

      const [activeRes, pendingRes, approvedMonthRes, rejectedMonthRes] = await Promise.all([
        supabase
          .from("users_profile")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("users_profile")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending_review"),
        supabase
          .from("users_profile")
          .select("id", { count: "exact", head: true })
          .eq("status", "active")
          .gte("approved_at", monthStart),
        supabase
          .from("users_profile")
          .select("id", { count: "exact", head: true })
          .eq("status", "rejected")
          .gte("updated_at", monthStart),
      ]);

      if (activeRes.error) throw activeRes.error;
      if (pendingRes.error) throw pendingRes.error;
      if (approvedMonthRes.error) throw approvedMonthRes.error;
      if (rejectedMonthRes.error) throw rejectedMonthRes.error;

      return {
        activeTotal: activeRes.count ?? 0,
        pendingTotal: pendingRes.count ?? 0,
        approvedThisMonth: approvedMonthRes.count ?? 0,
        rejectedThisMonth: rejectedMonthRes.count ?? 0,
      };
    },
  });
}
