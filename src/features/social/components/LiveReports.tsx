import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Radio, ArrowRight } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type IncomingReport = {
  id: string;
  postContent: string;
  severity: "low" | "moderate" | "high" | null;
  createdAt: string;
};

export function LiveReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<IncomingReport[]>([]);

  // Load initial recent unvalidated reports
  useEffect(() => {
    supabase
      .from("flood_reports")
      .select("id, post_content, model_severity, created_at")
      .eq("stage", "awaiting_hitl")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) {
          setReports(
            data.map((r) => ({
              id: r.id,
              postContent: r.post_content ?? "",
              severity: r.model_severity as "low" | "moderate" | "high" | null,
              createdAt: r.created_at ?? "",
            })),
          );
        }
      });
  }, []);

  // Subscribe to new INSERTs on flood_reports via Realtime
  useEffect(() => {
    const channel = supabase
      .channel("live-reports")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "flood_reports" },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const newRow = payload.new as Record<string, string>;
          setReports((prev) => [
            {
              id: newRow.id,
              postContent: newRow.post_content ?? "",
              severity: (newRow.model_severity || newRow.human_severity) as
                | "low"
                | "moderate"
                | "high"
                | null,
              createdAt: newRow.created_at ?? "",
            },
            ...prev.slice(0, 9),
          ]);
        },
      )
      .subscribe();

    // Also refresh every 30s as fallback
    const interval = setInterval(() => {
      supabase
        .from("flood_reports")
        .select("id, post_content, model_severity, created_at")
        .eq("stage", "awaiting_hitl")
        .order("created_at", { ascending: false })
        .limit(5)
        .then(({ data }) => {
          if (data) {
            setReports(
              data.map((r) => ({
                id: r.id,
                postContent: r.post_content ?? "",
                severity: r.model_severity as "low" | "moderate" | "high" | null,
                createdAt: r.created_at ?? "",
              })),
            );
          }
        });
    }, 30_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return (
    <Card size="sm">
      <CardContent className="p-4 md:p-5">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Radio className="size-3.5 animate-pulse text-red-500" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Live Incoming
            </p>
          </div>

          {reports.length === 0 ? (
            <p className="text-xs text-muted-foreground">No incoming reports.</p>
          ) : (
            <div className="space-y-1">
              {reports.slice(0, 5).map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate("/validate/" + r.id)}
                  className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {r.severity && <SeverityBadge severity={r.severity} />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                      {r.postContent}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Redirect to queue */}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
            onClick={() => navigate("/validate")}
          >
            Go to Queue
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
