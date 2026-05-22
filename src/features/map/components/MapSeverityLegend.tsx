import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MapSeverityLegendProps = {
  total: number;
  counts: { low: number; moderate: number; high: number };
  selected: string | null;
  onSelect: (v: string | null) => void;
};

const SEVERITY_ITEMS = [
  { key: "high", label: "High", dot: "bg-red-500", activeBg: "bg-red-50", activeText: "text-red-600" },
  { key: "moderate", label: "Moderate", dot: "bg-amber-500", activeBg: "bg-amber-50", activeText: "text-amber-600" },
  { key: "low", label: "Low", dot: "bg-green-500", activeBg: "bg-green-50", activeText: "text-green-600" },
] as const;

export function MapSeverityLegend({ total, counts, selected, onSelect }: MapSeverityLegendProps) {
  const allActive = selected === null;

  return (
    <Card size="sm">
      <CardContent className="p-4 md:p-5">
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Severity Legend
          </div>

          <div className="space-y-1">
            {/* All button */}
            <button
              onClick={() => onSelect(null)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-all active:scale-[0.97]",
                allActive
                  ? "bg-accent/10 font-semibold text-accent"
                  : "text-muted-foreground hover:bg-accent/10",
              )}
            >
              <span className="size-2 shrink-0 rounded-full bg-muted-foreground" />
              <span className="flex-1 font-medium">All</span>
              <span className="tabular-nums">{total}</span>
            </button>

            {/* Severity buttons */}
            {SEVERITY_ITEMS.map((s) => {
              const isActive = selected === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => onSelect(isActive ? null : s.key)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-all active:scale-[0.97]",
                    isActive
                      ? `${s.activeBg} font-semibold ${s.activeText}`
                      : "text-muted-foreground hover:bg-accent/10",
                  )}
                >
                  <span className={cn("size-2 shrink-0 rounded-full", s.dot)} />
                  <span className="flex-1 font-medium">{s.label}</span>
                  <span className="tabular-nums">{counts[s.key]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
