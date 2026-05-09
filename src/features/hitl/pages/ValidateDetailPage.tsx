import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Image, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import { PageTransition } from "@/components/shared/motion";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ValidationBadge } from "@/components/shared/ValidationBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import { useReportDetail } from "@/features/hitl/hooks/useReportDetail";
import { useValidateReport } from "@/features/hitl/hooks/useValidateReport";

export function ValidateDetailPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useReportDetail(reportId);
  const { mutate, isPending } = useValidateReport();
  const report = data?.report ?? null;
  const images = data?.images ?? [];
  const [selectedSeverity, setSelectedSeverity] = useState<
    "low" | "moderate" | "high" | ""
  >("");
  const [rationale, setRationale] = useState("");

  useEffect(() => {
    if (report?.model_severity) {
      setSelectedSeverity(report.model_severity);
    }
  }, [report?.model_severity]);

  const eventStatus = useMemo(() => {
    const status = report?.flood_event_status;
    if (status === "ongoing" || status === "clearing" || status === "resolved") {
      return status;
    }
    return null;
  }, [report?.flood_event_status]);

  const isValidated = Boolean(report?.validated_at);
  const isOverridden = Boolean(
    report?.human_severity && report?.model_severity && report?.human_severity !== report?.model_severity
  );
  const canConfirm = Boolean(report?.id && selectedSeverity && rationale.trim());
  const confidenceLabel = typeof report?.model_confidence === "number"
    ? `${Math.round(report.model_confidence * 100)}%`
    : "N/A";

  if (isLoading) {
    return (
      <PageTransition>
        <div className="py-12 text-center text-xs text-muted-foreground">
          Loading report details...
        </div>
      </PageTransition>
    );
  }

  if (!report) {
    return (
      <PageTransition>
        <EmptyState
          icon={MapPin}
          title="Report not found"
          description="The report may have been removed or already validated."
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Back + progress */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/validate")}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Queue
          </Button>
          <span className="text-xs text-muted-foreground">
            Report <span className="font-data">{reportId}</span>
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* ─── Left: Report Details ────────────────────────── */}
          <div className="space-y-4">
            <Card size="sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold">
                    Report Details
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-data">{report.post_id}</span>
                    <span>•</span>
                    <span>
                      {report.created_at
                        ? formatDistanceToNow(new Date(report.created_at), { addSuffix: true })
                        : "—"}
                    </span>
                    <span>•</span>
                    <span>{report.author?.full_name ?? "Unknown author"}</span>
                    <ValidationBadge isValidated={isValidated} isOverridden={isOverridden} />
                  </div>
                </div>
                {report.model_severity ? (
                  <SeverityBadge severity={report.model_severity} />
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-foreground/80">
                  {report.post_content}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {report.street_address ?? "No address"}
                  </span>
                  {eventStatus ? <StatusBadge status={eventStatus} /> : null}
                </div>

                {/* Image preview */}
                <div className="flex gap-2">
                  {images.length ? (
                    images.map((image) => (
                      <img
                        key={image.id}
                        src={image.image_url}
                        alt="Report evidence"
                        className="h-20 w-28 rounded-lg object-cover"
                      />
                    ))
                  ) : (
                    <div className="flex h-20 w-28 items-center justify-center rounded-lg bg-muted">
                      <Image className="size-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ─── Right: Validation Panel ─────────────────────── */}
          <div className="space-y-4">
            {/* AI Classification */}
            <Card size="sm" className="border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="size-4 text-accent" />
                  AI Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  {report.model_severity ? (
                    <SeverityBadge severity={report.model_severity} className="text-base px-4 py-1" />
                  ) : (
                    <Badge variant="outline">No model output</Badge>
                  )}
                </div>
                <div className="space-y-1 text-center text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Confidence</span>
                    <span className="font-data">{confidenceLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Model</span>
                    <span className="font-data">{report.model_version ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latency</span>
                    <span className="font-data">
                      {report.model_inference_ms != null ? `${report.model_inference_ms} ms` : "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verify form placeholder */}
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Expert Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Severity decision
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["low", "moderate", "high"] as const).map((severity) => (
                        <Button
                          key={severity}
                          type="button"
                          variant={selectedSeverity === severity ? "default" : "outline"}
                          className="h-9 rounded-lg text-xs"
                          onClick={() => setSelectedSeverity(severity)}
                        >
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Rationale
                    </label>
                    <Textarea
                      value={rationale}
                      onChange={(event) => setRationale(event.target.value)}
                      placeholder="Summarize why the severity was confirmed or overridden."
                      className="min-h-24 resize-none rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 gap-2 rounded-lg"
                    disabled={!canConfirm || isPending}
                    onClick={() =>
                      report?.id &&
                      mutate({
                        reportId: report.id,
                        humanSeverity: selectedSeverity as "low" | "moderate" | "high",
                        rationale: rationale.trim(),
                      })
                    }
                  >
                    <CheckCircle2 className="size-4" />
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 rounded-lg"
                    onClick={() => navigate("/validate")}
                  >
                    Next
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
