import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";

export function FeedStats() {
  const { data } = useQuery({
    queryKey: ["social", "stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      const [totalRes, todayRes, validatedRes, queueRes] = await Promise.all([
        supabase.from("flood_reports").select("*", { count: "exact", head: true }),
        supabase.from("flood_reports").select("*", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("flood_reports").select("*", { count: "exact", head: true }).eq("status", "validated"),
        supabase.from("flood_reports").select("*", { count: "exact", head: true }).eq("stage", "awaiting_hitl"),
      ]);

      return {
        total: totalRes.count ?? 0,
        today: todayRes.count ?? 0,
        validated: validatedRes.count ?? 0,
        queue: queueRes.count ?? 0,
      };
    },
    staleTime: 30_000,
  });

  const items = [
    { label: "Total Reports", value: data?.total ?? "—" },
    { label: "Today", value: data?.today ?? "—" },
    { label: "Verified", value: data?.validated ?? "—" },
    { label: "In Queue", value: data?.queue ?? "—" },
  ];

  return (
    <Card size="sm">
      <CardContent className="p-4 md:p-5">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Overview
          </p>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="font-data text-sm font-semibold tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
