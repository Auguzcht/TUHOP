import { useEffect, useRef } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useDailyProgress } from "@/features/hitl/hooks/useDailyProgress";

type QueueOverviewProps = {
  total: number;
  high: number;
  moderate: number;
  low: number;
};

export function QueueOverview({
  total,
  high,
  moderate,
  low,
}: QueueOverviewProps) {
  const prevTotal = useRef(total);
  const innerRef = useRef<HTMLDivElement>(null);
  const { data: progress } = useDailyProgress();

  useEffect(() => {
    if (total !== prevTotal.current && innerRef.current) {
      const el = innerRef.current;
      el.style.transition = "transform 0.2s ease";
      el.style.transform = "scale(1.01)";
      const t = setTimeout(() => {
        el.style.transform = "";
      }, 200);
      prevTotal.current = total;
      return () => clearTimeout(t);
    }
  }, [total]);

  const items = [
    {
      label: "High",
      value: high,
      dot: "bg-red-500",
      bar: "bg-red-500",
      pct: total > 0 ? (high / total) * 100 : 0,
    },
    {
      label: "Moderate",
      value: moderate,
      dot: "bg-amber-500",
      bar: "bg-amber-500",
      pct: total > 0 ? (moderate / total) * 100 : 0,
    },
    {
      label: "Low",
      value: low,
      dot: "bg-green-500",
      bar: "bg-green-500",
      pct: total > 0 ? (low / total) * 100 : 0,
    },
  ];

  const reviewed = progress?.reviewed ?? 0;
  const pendingTotal = progress?.total ?? 0;

  return (
    <Card size="sm">
      <CardContent className="p-4 md:p-5">
        <div ref={innerRef} className="space-y-5">
          {/* ─── Total Pending ────────────────────────────── */}
          <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Queue Overview
            </div>
            <div className="text-2xl font-semibold tabular-nums">{total}</div>
            <div className="text-xs text-muted-foreground">
              Total Pending
            </div>
          </div>

          {/* ─── Stacked severity bar ─────────────────────── */}
          {total > 0 && (
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              {items
                .filter((s) => s.value > 0)
                .map((s) => (
                  <div
                    key={s.label}
                    className={s.bar}
                    style={{ width: `${s.pct}%` }}
                  />
                ))}
            </div>
          )}

          {/* ─── Severity mini-cards ──────────────────────── */}
          <div className="grid grid-cols-3 gap-2">
            {items.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center rounded-lg border border-border/40 px-2 py-2"
              >
                <div className="flex items-center gap-1.5">
                  <span className={`inline size-2 rounded-full ${s.dot}`} />
                  <span className="font-data text-lg font-semibold tabular-nums">
                    {s.value}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* ─── Today's Progress ─────────────────────────── */}
          <div className="space-y-2 rounded-lg border border-border/40 px-3 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Reviewed Today</span>
              <span className="font-data font-semibold tabular-nums">
                {reviewed} / {reviewed + pendingTotal}
              </span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="rounded-full bg-blue-500 transition-all duration-500"
                style={{
                  width: `${(reviewed + pendingTotal) > 0 ? (reviewed / (reviewed + pendingTotal)) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground">
              {reviewed > 0
                ? `${reviewed} validated today`
                : "No validations yet today"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
