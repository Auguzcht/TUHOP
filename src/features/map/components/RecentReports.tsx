import { useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MapReport } from "@/features/map/hooks/useMapData";

type RecentReportsProps = {
  reports: MapReport[];
};

const SEVERITY_DOT = {
  low: "bg-green-500",
  moderate: "bg-amber-500",
  high: "bg-red-500",
} as const;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function RecentReports({ reports }: RecentReportsProps) {
  const recent = useMemo(() => {
    return [...reports]
      .sort((a, b) => new Date(b.validatedAt).getTime() - new Date(a.validatedAt).getTime())
      .slice(0, 6);
  }, [reports]);

  return (
    <Card size="sm">
      <CardContent className="p-4 md:p-5">
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recent Reports (Last 7 Days)
          </div>
          {recent.length === 0 ? (
            <p className="text-xs text-muted-foreground">No validated reports yet.</p>
          ) : (
            <div className="space-y-1">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
                >
                  <span className={cn("mt-1 size-2 shrink-0 rounded-full", SEVERITY_DOT[r.humanSeverity])} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{r.barangayName}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {r.streetAddress ?? r.postContent.slice(0, 60)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(r.validatedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
