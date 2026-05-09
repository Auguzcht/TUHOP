import { useMemo } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Timer } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";

import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/motion";
import { StatCard } from "@/components/shared/StatCard";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { DataTable } from "@/components/shared/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useModelPerformance } from "@/features/audit/hooks/useModelPerformance";
import { usePerSeverityPrecision } from "@/features/audit/hooks/usePerSeverityPrecision";
import { useVerificationLog } from "@/features/audit/hooks/useVerificationLog";

export function ModelAuditPage() {
  const { data: performance } = useModelPerformance();
  const { data: precision } = usePerSeverityPrecision();
  const { data: verificationLog, isLoading: isLogLoading } = useVerificationLog();
  const modelSnapshot = performance?.[0];
  type LogRow = NonNullable<typeof verificationLog>[number];

  const accuracyRate = modelSnapshot?.accuracy_rate;
  const accuracyLabel =
    accuracyRate == null
      ? "—"
      : accuracyRate > 1
        ? `${Math.round(accuracyRate)}%`
        : `${Math.round(accuracyRate * 100)}%`;

  const columns = useMemo<ColumnDef<LogRow>[]>(
    () => [
      {
        accessorKey: "post_id",
        header: "Report",
        cell: ({ row }) => row.original.post_id ?? row.original.id,
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) =>
          `${row.original.barangay?.name ?? "Unknown"}, ${
            row.original.barangay?.districts?.name ?? "Unknown"
          }`,
      },
      {
        accessorKey: "model_severity",
        header: "Model",
        cell: ({ row }) =>
          row.original.model_severity ? (
            <SeverityBadge severity={row.original.model_severity} />
          ) : (
            <Badge variant="outline">N/A</Badge>
          ),
      },
      {
        accessorKey: "human_severity",
        header: "Expert",
        cell: ({ row }) =>
          row.original.human_severity ? (
            <SeverityBadge severity={row.original.human_severity} />
          ) : (
            <Badge variant="outline">N/A</Badge>
          ),
      },
      {
        accessorKey: "validator",
        header: "Validator",
        cell: ({ row }) => row.original.validator?.full_name ?? "—",
      },
      {
        accessorKey: "validated_at",
        header: "Validated",
        cell: ({ row }) =>
          row.original.validated_at
            ? formatDistanceToNow(new Date(row.original.validated_at), { addSuffix: true })
            : "—",
      },
    ],
    []
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading">Model Audit</h1>
          <p className="text-sm text-muted-foreground">
            Track model accuracy, overrides, and expert verification outcomes.
          </p>
        </div>

        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatCard
              icon={CheckCircle2}
              label="Validated"
              value={modelSnapshot?.total_validated ?? "—"}
              subtext="Total expert reviews"
              delay={0}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              icon={BarChart3}
              label="Accuracy"
              value={accuracyLabel}
              subtext="Overall model precision"
              delay={0.05}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              icon={AlertTriangle}
              label="Overrides"
              value={modelSnapshot?.overridden ?? "—"}
              subtext="Expert corrections"
              delay={0.1}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              icon={Timer}
              label="Avg Latency"
              value={modelSnapshot?.avg_inference_ms != null ? `${Math.round(modelSnapshot.avg_inference_ms)} ms` : "—"}
              subtext={modelSnapshot?.model_version ?? "Latest model"}
              delay={0.15}
            />
          </StaggerItem>
        </StaggerContainer>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per-severity precision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {(["low", "moderate", "high"] as const).map((severity) => (
                <div
                  key={severity}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
                >
                  <SeverityBadge severity={severity} />
                  <span className="text-sm font-medium">
                    {precision
                      ? `${Math.round(precision.precision[severity] * 100)}%`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent validations</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={verificationLog ?? []}
              isLoading={isLogLoading}
            />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
