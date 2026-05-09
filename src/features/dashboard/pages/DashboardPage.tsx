import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

import { StatCard } from "@/components/shared/StatCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/motion";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";
import { useRecentAlerts } from "@/features/dashboard/hooks/useRecentAlerts";

export function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { data: statsData } = useDashboardStats();
  const { data: recentAlerts, isLoading: isAlertsLoading } = useRecentAlerts();
  const isAdminOrValidator = useMemo(
    () => profile?.role === "admin" || profile?.role === "hitl_validator",
    [profile?.role]
  );
  const queueItems = recentAlerts?.items ?? [];

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
      trend: "Live feed",
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
        {/* Header */}
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

        {/* Stat cards */}
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

        {/* Queue preview + trend placeholder */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Queue preview */}
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
                            <SeverityBadge severity={item.severity} />
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

          {/* Trend preview */}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="size-4 text-accent" />
                Classification Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-muted">
                <div className="flex flex-col items-center gap-1 text-center">
                  <TrendingUp className="size-6 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground/50">
                    Chart loads with data
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Severity distribution placeholder */}
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Severity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {(["low", "moderate", "high"] as const).map((severity) => (
                <div
                  key={severity}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border/40 p-4"
                >
                  <SeverityBadge severity={severity} className="text-sm" />
                  <span className="text-2xl font-semibold tabular-nums">—</span>
                  <span className="text-xs text-muted-foreground">reports</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
