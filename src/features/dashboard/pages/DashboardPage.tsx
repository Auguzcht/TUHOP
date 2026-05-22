import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileText,
  TrendingUp,
} from "lucide-react";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuthStore } from "@/stores/auth-store";
import { StatCard } from "@/components/shared/StatCard";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DistributionDonut } from "@/features/dashboard/components/DistributionDonut";

import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";
import { useRecentAlerts } from "@/features/dashboard/hooks/useRecentAlerts";
import { useSeverityTrend } from "@/features/dashboard/hooks/useSeverityTrend";
import { useDistrictSeverity } from "@/features/dashboard/hooks/useDistrictSeverity";
import { useModelPerformance } from "@/features/dashboard/hooks/useModelPerformance";
import { useTopBarangays } from "@/features/dashboard/hooks/useTopBarangays";
import { useRecentOverrides } from "@/features/dashboard/hooks/useRecentOverrides";


/** Transforms trend rows → { date, low, moderate, high } and renders a stacked bar chart */
function TrendChart({ data }: { data: { flood_date: string | null; report_count: number | null; severity: string | null }[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, { date: string; low: number; moderate: number; high: number }>();
    for (const row of data) {
      const date = row.flood_date ?? "";
      if (!map.has(date)) map.set(date, { date, low: 0, moderate: 0, high: 0 });
      const entry = map.get(date)!;
      if (row.severity === "low") entry.low += row.report_count ?? 0;
      else if (row.severity === "moderate") entry.moderate += row.report_count ?? 0;
      else if (row.severity === "high") entry.high += row.report_count ?? 0;
    }
    return Array.from(map.values());
  }, [data]);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={grouped} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap="12%">
          <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} padding={{ left: 0, right: 0 }} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} width={20} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Bar dataKey="low" stackId="a" fill="var(--severity-low)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="moderate" stackId="a" fill="var(--severity-moderate)" />
          <Bar dataKey="high" stackId="a" fill="var(--severity-high)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { data: statsData } = useDashboardStats();
  const { data: recentAlerts, isLoading: isAlertsLoading } = useRecentAlerts();
  const { data: trendData } = useSeverityTrend();
  const { data: districtData } = useDistrictSeverity();
  const { data: modelPerf } = useModelPerformance();
  const { data: topBarangays } = useTopBarangays();
  const { data: overrides } = useRecentOverrides();

  const isAdminOrValidator = useMemo(
    () => profile?.role === "admin" || profile?.role === "hitl_validator",
    [profile?.role]
  );

  const queueItems = recentAlerts?.items ?? [];

  // ── Severity distribution (from v_daily_trend or direct query) ──
  const severityDist = useMemo(() => {
    if (!trendData?.length) return null;
    const counts: Record<string, number> = { low: 0, moderate: 0, high: 0 };
    for (const row of trendData) {
      if (row.severity) counts[row.severity] += row.report_count ?? 0;
    }
    return [
      { name: "Low", value: counts.low, color: "var(--severity-low)" },
      { name: "Moderate", value: counts.moderate, color: "var(--severity-moderate)" },
      { name: "High", value: counts.high, color: "var(--severity-high)" },
    ];
  }, [trendData]);

  // ── District distribution ──
  const districtDist = useMemo(() => {
    if (!districtData?.length) return null;
    const map: Record<string, number> = {};
    for (const row of districtData) {
      const name = row.district_name ?? "Unknown";
      map[name] = (map[name] ?? 0) + (row.report_count ?? 0);
    }
    const colors = [
      "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
      "var(--chart-4)", "var(--chart-5)", "var(--accent)",
      "#8B5CF6", "#F59E0B", "#10B981", "#EC4899", "#3B82F6",
    ];
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [districtData]);

  // ── Top barangays ──
  const topBarangayDist = useMemo(() => {
    if (!topBarangays?.length) return null;
    return topBarangays.map((b, i) => ({
      name: b.barangay_name,
      value: b.report_count,
      color: `var(--chart-${(i % 5) + 1})`,
      district: b.district_name,
    }));
  }, [topBarangays]);

  // ── Model perf derived ──
  const perf = useMemo(() => {
    if (!modelPerf?.length) return null;
    const row = modelPerf[0];
    const total = (row.confirmed ?? 0) + (row.overridden ?? 0);
    return {
      accuracy: row.accuracy_rate != null ? Number(row.accuracy_rate) * 100 : null,
      confirmed: row.confirmed ?? 0,
      overridden: row.overridden ?? 0,
      total,
      version: row.model_version ?? "—",
    };
  }, [modelPerf]);

  // ── Override-only items ──
  const overrideItems = useMemo(
    () => (overrides ?? []).filter((r) => r.modelSeverity !== r.humanSeverity),
    [overrides]
  );

  const stats = [
    {
      icon: FileText,
      label: "Total Reports",
      value: statsData?.total ?? "—",
      subtext: "All time submissions",
      delay: 0,
    },
    {
      icon: Activity,
      label: "Today's Reports",
      value: statsData?.today ?? "—",
      subtext: "Submitted today",
      trend: statsData?.today ? `${statsData.today} new` : undefined,
      delay: 0.05,
    },
    {
      icon: CheckCircle2,
      label: "Verified",
      value: statsData?.verified ?? "—",
      subtext: "HITL confirmed",
      delay: 0.1,
    },
    {
      icon: AlertTriangle,
      label: "Overrides",
      value: statsData?.overrides ?? "—",
      subtext: "Model overrides",
      delay: 0.15,
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* ─── Header ─────────────────────────────────────── */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Flood severity classification overview
            </p>
          </div>
          {isAdminOrValidator && (
            <Button
              onClick={() => navigate("/validate")}
              className="mt-2 sm:mt-0"
            >
              <ClipboardList className="mr-2 size-4" />
              Go to Queue
            </Button>
          )}
        </div>

        {/* ─── Stat cards ──────────────────────────────────── */}
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <StatCard
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                subtext={stat.subtext}
                trend={stat.trend}
                delay={stat.delay}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* ─── Priority Queue + Trend ──────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card size="sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Priority Queue
              </CardTitle>
              {isAdminOrValidator && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-accent"
                  onClick={() => navigate("/validate")}
                >
                  View all →
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isAlertsLoading ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Loading queue preview...
                </div>
              ) : queueItems.length ? (
                <div className="divide-y divide-border/40">
                  {queueItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-data text-xs text-muted-foreground">
                            {item.postId}
                          </span>
                          {item.severity ? (
                            <SeverityBadge severity={item.severity as "low" | "moderate" | "high"} />
                          ) : null}
                        </div>
                        <span className="truncate text-xs text-muted-foreground">
                          {item.streetAddress ?? "No address"}
                        </span>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {item.createdAt
                          ? `${formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}`
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={AlertTriangle}
                  title="Queue is empty"
                  description="Awaiting HITL submissions will appear here."
                />
              )}
            </CardContent>
          </Card>

          {/* Trend chart */}
          <Card size="sm" className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="size-4 text-accent" />
                Classification Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col px-0 pb-4 md:pb-5">
              {trendData && trendData.length > 0 ? (
                <div className="flex-1">
                  <TrendChart data={trendData} />
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-muted">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <TrendingUp className="size-6 text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground/50">
                      No trend data yet
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Distribution Charts ──────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DistributionDonut
            title="Severity Distribution"
            data={
              severityDist ?? [
                { name: "Low", value: 0, color: "var(--severity-low)" },
                { name: "Moderate", value: 0, color: "var(--severity-moderate)" },
                { name: "High", value: 0, color: "var(--severity-high)" },
              ]
            }
            summary={
              severityDist
                ? `${severityDist.find((s) => s.name === "High")?.value ?? 0} High reports`
                : undefined
            }
          />

          <DistributionDonut
            title="Flood Distribution Per District"
            data={
              districtDist ?? [
                { name: "No data", value: 1, color: "var(--muted)" },
              ]
            }
            summary={
              districtDist
                ? `${districtDist[0]?.name ?? "—"} most affected`
                : undefined
            }
          />

          <DistributionDonut
            title="Top 5 Flood-Prone Barangays"
            data={
              topBarangayDist ?? [
                { name: "No data", value: 1, color: "var(--muted)" },
              ]
            }
            summary={
              topBarangayDist
                ? `${topBarangayDist[0]?.name ?? "—"} #1`
                : undefined
            }
          />
        </div>

        {/* ─── Bottom Row: Overrides + Model Perf ───────────── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Recent overrides */}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Recent Overrides
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {overrideItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/40 text-left text-muted-foreground">
                        <th className="px-4 py-2 font-medium">POST ID</th>
                        <th className="px-4 py-2 font-medium">BARANGAY</th>
                        <th className="px-4 py-2 font-medium">AI</th>
                        <th className="px-4 py-2 font-medium" />
                        <th className="px-4 py-2 font-medium">HUMAN</th>
                        <th className="px-4 py-2 font-medium">DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overrideItems.slice(0, 5).map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-border/20 hover:bg-muted/20"
                        >
                          <td className="px-4 py-2.5 font-data text-muted-foreground">
                            {item.postId}
                          </td>
                          <td className="px-4 py-2.5">
                            {item.barangayName ?? "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            {item.modelSeverity ? (
                              <SeverityBadge severity={item.modelSeverity as "low" | "moderate" | "high"} />
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-2 py-2.5 text-center text-muted-foreground">
                            <ArrowRight className="inline size-3" />
                          </td>
                          <td className="px-4 py-2.5">
                            {item.humanSeverity ? (
                              <SeverityBadge severity={item.humanSeverity as "low" | "moderate" | "high"} />
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {item.validatedAt
                              ? formatDistanceToNow(
                                  new Date(item.validatedAt),
                                  { addSuffix: true }
                                )
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 pb-4">
                  <EmptyState
                    icon={AlertTriangle}
                    title="No overrides yet"
                    description="Model vs. human severity mismatches will appear here."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model performance */}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="size-4 text-accent" />
                AI Model Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {perf ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative flex size-28 items-center justify-center">
                      <svg className="size-28 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="oklch(0.9 0.005 240)"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="oklch(0.65 0.14 185)"
                          strokeWidth="3"
                          strokeDasharray={`${perf.accuracy ?? 0} ${100 - (perf.accuracy ?? 0)}`}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                      </svg>
                      <span className="absolute font-data text-xl font-semibold tabular-nums">
                        {perf.accuracy != null
                          ? `${Math.round(perf.accuracy)}%`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model</span>
                      <span className="font-data">{perf.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confirmed</span>
                      <span className="font-data">{perf.confirmed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Overridden</span>
                      <span className="font-data">{perf.overridden}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total validated</span>
                      <span className="font-data">{perf.total}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-muted">
                  <span className="text-xs text-muted-foreground/50">
                    Model performance loading...
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
