import { Card, CardContent } from "@/components/ui/card";

type MapAnalyticsProps = {
  totalInRange: number;
  severityCounts: { low: number; moderate: number; high: number };
};

export function MapAnalytics({ totalInRange, severityCounts }: MapAnalyticsProps) {
  const sevItems = [
    { label: "High", value: severityCounts.high, dot: "bg-red-500", bar: "bg-red-500", text: "text-red-600" },
    { label: "Moderate", value: severityCounts.moderate, dot: "bg-amber-500", bar: "bg-amber-500", text: "text-amber-600" },
    { label: "Low", value: severityCounts.low, dot: "bg-green-500", bar: "bg-green-500", text: "text-green-600" },
  ];

  return (
    <Card size="sm">
      <CardContent className="p-4 md:p-5">
        <div className="space-y-4">
          {/* Total count */}
          <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Reports
            </div>
            <div className="text-2xl font-semibold tabular-nums">{totalInRange}</div>
            <div className="text-xs text-muted-foreground">
              Selected date range
            </div>
          </div>

          {/* Stacked severity bar — moved from SeverityLegend into breakdown */}
          {totalInRange > 0 && (
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              {sevItems
                .filter((s) => s.value > 0)
                .map((s) => (
                  <div
                    key={s.label}
                    className={s.bar}
                    style={{ width: `${(s.value / totalInRange) * 100}%` }}
                  />
                ))}
            </div>
          )}

          {/* Severity mini-cards (QueueOverview style) */}
          <div className="grid grid-cols-3 gap-2">
            {sevItems.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center rounded-lg border border-border/40 px-2 py-2"
              >
                <div className="flex items-center gap-1.5">
                  <span className={`inline size-2 rounded-full ${s.dot}`} />
                  <span className={`font-data text-lg font-semibold tabular-nums ${s.text}`}>
                    {s.value}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
