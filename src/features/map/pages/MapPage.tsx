import { useState, useMemo } from "react";

import { PageTransition } from "@/components/shared/motion";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { useMapData, useRecentReports } from "@/features/map/hooks/useMapData";
import { MapAnalytics } from "@/features/map/components/MapAnalytics";
import { MapSeverityLegend } from "@/features/map/components/MapSeverityLegend";
import { MapDatePicker } from "@/features/map/components/MapDatePicker";
import { RecentReports } from "@/features/map/components/RecentReports";
import { MapView } from "@/features/map/components/MapView";

function today() {
  return new Date().toISOString().split("T")[0];
}

export function MapPage() {
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const { isAllowed: showAnalytics } = useRoleGuard(["hitl_validator", "admin"]);

  const { data, isLoading } = useMapData(startDate, endDate);
  const { data: recentReports } = useRecentReports();

  // Legend total uses the date-range reports
  const legendCounts = useMemo(() => {
    if (!data) return { low: 0, moderate: 0, high: 0 };
    return {
      low: data.reports.filter((r) => r.humanSeverity === "low").length,
      moderate: data.reports.filter((r) => r.humanSeverity === "moderate").length,
      high: data.reports.filter((r) => r.humanSeverity === "high").length,
    };
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoadingSpinner size="lg" label="Loading map data..." />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* ─── Header ─────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <h1 className="font-heading">Geohazard Map</h1>
          <p className="text-sm text-muted-foreground">
            Validated flood reports rendered on an interactive map.
          </p>
        </div>

        {/* ─── Grid: Sidebar + Map ──────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left sidebar */}
          <aside className="space-y-4">
            {/* Date range picker */}
            <MapDatePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />

            {showAnalytics && (
              <MapAnalytics
                totalInRange={data.totalInRange}
                severityCounts={data.severityCounts}
              />
            )}

            <MapSeverityLegend
              total={data.reports.length}
              counts={legendCounts}
              selected={selectedSeverity}
              onSelect={setSelectedSeverity}
            />

            {/* Recent reports always shows last 7 days — independent of date picker */}
            <RecentReports reports={recentReports ?? []} />
          </aside>

          {/* Right: Map */}
          <main className="relative min-h-[600px] overflow-hidden rounded-xl border bg-muted/20 lg:min-h-[calc(100vh-12rem)]">
            <MapView
              reports={data.reports}
              selectedSeverity={selectedSeverity}
            />
          </main>
        </div>
      </div>
    </PageTransition>
  );
}
