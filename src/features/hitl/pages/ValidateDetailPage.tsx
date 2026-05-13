import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Loader2,
  MapPin,
  UserCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import { PageTransition } from "@/components/shared/motion";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageZoom } from "@/components/animate-ui/primitives/effects/image-zoom";
import { useReportDetail } from "@/features/hitl/hooks/useReportDetail";
import { useValidateReport } from "@/features/hitl/hooks/useValidateReport";
import { useValidationStore } from "@/stores/validation-store";
import {
  PHYSICAL_REFERENCE_OPTIONS,
  MOBILITY_IMPACT_OPTIONS,
} from "@/lib/constants";

// ─── Confidence parser ─────────────────────────────────────

function parseTopConfidence(
  mc: unknown
): { label: string; score: number } | null {
  if (!mc || typeof mc !== "object") return null;
  const obj = mc as Record<string, number>;
  const entries = Object.entries(obj).filter(
    ([, v]) => typeof v === "number" && !isNaN(v)
  );
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { label: entries[0][0], score: entries[0][1] };
}

const SEVERITY_COLORS: Record<string, string> = {
  low: "oklch(0.72 0.19 145)",
  moderate: "oklch(0.78 0.16 85)",
  high: "oklch(0.62 0.22 25)",
};

// ─── Double-click editable fields ─────────────────────────

function useEditableField(
  key: string,
  initialValue: string
): [string, (v: string) => void] {
  const storageKey = `hitl-draft-${key}`;
  const [val, setVal] = useState(() => {
    try {
      return sessionStorage.getItem(storageKey) ?? initialValue;
    } catch {
      return initialValue;
    }
  });

  // Sync from initialValue when report data loads, but only if no draft exists
  const synced = useRef(false);
  useEffect(() => {
    if (synced.current) return;
    if (!initialValue) return;
    try {
      const draft = sessionStorage.getItem(storageKey);
      if (draft !== null) {
        synced.current = true;
        return; // user has a draft, keep it
      }
    } catch {
      // sessionStorage unavailable — ignore
    }
    // No draft and initialValue is available — populate the field
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVal(initialValue);
    synced.current = true;
  }, [initialValue, storageKey]);

  const persist = useCallback(
    (v: string) => {
      setVal(v);
      try {
        sessionStorage.setItem(storageKey, v);
      } catch {
        // sessionStorage unavailable — ignore
      }
    },
    [storageKey]
  );

  return [val, persist];
}

type EditableSelectProps = {
  label: string;
  value: string;
  freeText: string;
  options: readonly { value: string; label: string; textDefault: string }[];
  onValueChange: (v: string) => void;
  onFreeTextChange: (v: string) => void;
};

function EditableSelect({
  label,
  value,
  freeText,
  options,
  onValueChange,
  onFreeTextChange,
}: EditableSelectProps) {
  const [editing, setEditing] = useState(false);
  const [checkDone, setCheckDone] = useState(false);

  // Build display label: enum label + custom text
  const enumLabel = options.find((o) => o.value === value)?.label;
  const displayParts = [enumLabel, freeText].filter(Boolean);
  const displayLabel = displayParts.length > 0 ? displayParts.join(" — ") : null;

  const handleDone = () => {
    setCheckDone(true);
    setTimeout(() => {
      setCheckDone(false);
      setEditing(false);
    }, 300);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {editing ? (
        <div className="space-y-2">
          <Select value={value || "__none__"} onValueChange={(v) => onValueChange(v === "__none__" ? "" : v)}>
            <SelectTrigger className="h-8 rounded-lg text-xs">
              <SelectValue placeholder="Select CDRRMO category..." />
            </SelectTrigger>
            <SelectContent>
              {/* Option to clear selection */}
              <SelectItem value="__none__" className="text-xs italic text-muted-foreground/60">
                None — custom text only
              </SelectItem>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={freeText}
            onChange={(e) => onFreeTextChange(e.target.value)}
            placeholder="Optional: add a custom description..."
            className="min-h-16 resize-none rounded-lg text-xs"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 gap-1.5 rounded-lg text-xs font-medium"
              onClick={handleDone}
            >
              <CheckCircle2
                className={`size-3.5 transition-all duration-200 ${
                  checkDone ? "scale-125" : ""
                }`}
              />
              Done
            </Button>
            {enumLabel || freeText ? (
              <span className="text-[10px] text-muted-foreground/50">
                {enumLabel && freeText
                  ? "Both will be saved"
                  : enumLabel
                    ? "Category selected"
                    : "Custom text set"}
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          className="group cursor-pointer rounded-lg border border-dashed border-border/60 px-3 py-2 text-sm transition-colors hover:border-accent/50 hover:bg-accent/5"
          onDoubleClick={() => setEditing(true)}
        >
          {displayLabel ? (
            <span>{displayLabel}</span>
          ) : (
            <span className="text-xs text-muted-foreground/50">
              Not set
            </span>
          )}
          <span className="ml-2 text-[10px] text-muted-foreground/30 transition-opacity group-hover:text-muted-foreground/60">
            double-click to edit
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Image Gallery ────────────────────────────────────────

function ImageGallery({ images }: { images: { id: string; image_url: string }[] }) {
  const [selected, setSelected] = useState(0);
  const hasImages = images.length > 0;
  const activeImage = hasImages ? images[selected] : null;

  return (
    <Card size="sm" className="overflow-hidden">
      <CardContent className="p-0">
        {/* Thumbnails (always on top) */}
        {hasImages && (
          <div className="flex gap-2 overflow-x-auto border-b border-border/40 p-3">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelected(i)}
                className={`relative shrink-0 overflow-hidden rounded-lg ring-2 transition-all duration-200 ${
                  i === selected
                    ? "ring-accent ring-offset-1 ring-offset-card"
                    : "ring-transparent opacity-60 hover:opacity-100"
                }`}
                style={{ width: 72, height: 56 }}
              >
                <img
                  src={img.image_url}
                  alt={`Photo ${i + 1}`}
                  className="size-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}

        {/* Preview (below thumbnails) */}
        <AspectRatio ratio={16 / 9} className="bg-muted">
          {hasImages ? (
            <ImageZoom zoomScale={2.5} zoomOnHover zoomOnClick className="size-full">
              <img
                src={activeImage!.image_url}
                alt="Flood evidence preview"
                className="size-full object-contain"
                draggable={false}
              />
            </ImageZoom>
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground/50">
              <div className="rounded-lg border border-dashed border-border/40 px-8 py-6 text-center">
                <p className="text-xs font-medium">No attachment images</p>
                <p className="mt-1 text-[10px]">The report was submitted without photo evidence.</p>
              </div>
            </div>
          )}
        </AspectRatio>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────

export function ValidateDetailPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useReportDetail(reportId);
  const { mutate, isPending, isSuccess } = useValidateReport();
  const report = data?.report ?? null;
  const images = data?.images ?? [];
  const markViewed = useValidationStore((s) => s.markViewed);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDiscard, setShowDiscard] = useState<"back" | "next" | null>(null);

  // Mark as viewed once data loads
  useEffect(() => {
    if (report?.id) markViewed(report.id);
  }, [report?.id, markViewed]);

  // Show success and redirect on mutation success
  useEffect(() => {
    if (isSuccess) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSuccess(true);
      const t = setTimeout(() => {
        navigate("/validate");
        document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [isSuccess, navigate]);
  const [selectedSeverity, setSelectedSeverity] = useState<
    "low" | "moderate" | "high" | ""
  >("");

  const [rationale, setRationale] = useState("");

  // Editable fields persisted to sessionStorage
  const [physRef, setPhysRef] = useEditableField(
    `${reportId}-phys-ref`,
    report?.physical_reference ?? ""
  );
  const [physRefText, setPhysRefText] = useEditableField(
    `${reportId}-phys-ref-text`,
    report?.physical_reference_text ?? ""
  );
  const [mobImp, setMobImp] = useEditableField(
    `${reportId}-mob-imp`,
    report?.mobility_impact ?? ""
  );
  const [mobImpText, setMobImpText] = useEditableField(
    `${reportId}-mob-imp-text`,
    report?.mobility_impact_text ?? ""
  );

  useEffect(() => {
    if (report?.model_severity) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSeverity(report.model_severity);
    }
  }, [report?.model_severity]);

  const topConf = parseTopConfidence(report?.model_confidence);
  const eventStatus = useMemo(() => {
    const s = report?.flood_event_status;
    if (s === "ongoing" || s === "clearing" || s === "resolved") return s;
    return null;
  }, [report?.flood_event_status]);

  const isOverride = Boolean(
    report?.model_severity &&
    selectedSeverity &&
    selectedSeverity !== report.model_severity
  );
  const canConfirm = Boolean(
    report?.id && selectedSeverity && (!isOverride || rationale.trim())
  );

  const authorName = report?.author?.full_name ?? "Unknown";
  const authorRole = report?.author?.role ?? null;
  const authorAvatar = report?.author?.avatar_url ?? null;

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" label="Loading report..." />
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
        {/* ─── Back bar ────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiscard("back")}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Queue
          </Button>
          <span className="text-xs text-muted-foreground">
            Report <span className="font-data">{reportId}</span>
          </span>
        </div>

        {/* Discard changes dialog — Back */}
        <AlertDialog open={showDiscard === "back"} onOpenChange={(o) => !o && setShowDiscard(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-sans text-base font-semibold">Discard changes?</AlertDialogTitle>
              <AlertDialogDescription>
                Your edits to the validation fields will be saved as drafts, but you'll leave the current review.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay</AlertDialogCancel>
              <AlertDialogAction onClick={() => navigate("/validate")}>
                Leave
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          {/* ═══════════════════════════════════════════════════
              LEFT PANEL — 2 cards only
             ═══════════════════════════════════════════════════ */}
          <div className="space-y-4">
            {/* ─── Card 1: Author + Content + Location ──────── */}
            <Card size="sm">
              <CardContent className="p-5 md:p-6">
                {/* Author row */}
                <div className="flex items-start gap-3">
                  <Avatar className="size-10 shrink-0 ring-2 ring-border">
                    {authorAvatar ? (
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="size-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-xs font-semibold">
                        {authorName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-semibold">{authorName}</span>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {authorRole ? <RoleBadge role={authorRole} /> : null}
                      {report.barangay?.name ? (
                        <>
                          <span>{report.barangay.name}</span>
                          {report.barangay?.district?.name ? (
                            <>
                              <span>·</span>
                              <span>{report.barangay.district.name}</span>
                            </>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </div>
                  {/* Date + assigned barangay on the right */}
                  <div className="ml-auto shrink-0 text-right text-xs">
                    <div className="text-muted-foreground">
                      {report.created_at
                        ? formatDistanceToNow(new Date(report.created_at), {
                            addSuffix: true,
                          })
                        : "—"}
                    </div>
                    {report.author?.barangay ? (
                      <div className="mt-1 text-muted-foreground/60">
                        <div className="text-[10px]">Assigned to</div>
                        <div className="font-medium">
                          {report.author.barangay.name}
                          {report.author.barangay.district?.name
                            ? ` · ${report.author.barangay.district.name}`
                            : ""}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Post content */}
                {report.post_content && (
                  <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                    {report.post_content}
                  </p>
                )}

                <Separator className="my-4" />

                {/* Location + status */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {report.street_address ?? "No address"}
                    {report.barangay?.name ? `, ${report.barangay.name}` : ""}
                  </span>
                  {eventStatus ? <StatusBadge status={eventStatus} /> : null}
                </div>
              </CardContent>
            </Card>

            {/* ─── Card 2: Image Gallery + Preview ─────────── */}
            <ImageGallery images={images} />
          </div>

          {/* ═══════════════════════════════════════════════════
              RIGHT PANEL
             ═══════════════════════════════════════════════════ */}
          <div className="space-y-4">
            {/* ─── AI Classification ────────────────────────── */}
            <Card size="sm" className="border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Brain className="size-4 text-accent" />
                  AI Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.model_severity ? (
                  <div className="text-center">
                    <span
                      className="font-sans-rounded text-3xl font-bold tracking-tight"
                      style={{
                        color: SEVERITY_COLORS[report.model_severity],
                      }}
                    >
                      {report.model_severity.toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <div className="py-2 text-center text-xs text-muted-foreground">
                    No model output
                  </div>
                )}

                {/* Confidence bar */}
                {topConf ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium capitalize">
                        {topConf.label}
                      </span>
                      <span className="font-data tabular-nums">
                        {(topConf.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="rounded-full transition-all"
                        style={{
                          width: `${Math.round(topConf.score * 100)}%`,
                          background:
                            SEVERITY_COLORS[report.model_severity ?? ""] ??
                            "var(--accent)",
                        }}
                      />
                    </div>
                  </div>
                ) : null}

                {/* Stats */}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Model</span>
                    <span className="font-data">
                      {report.model_version ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latency</span>
                    <span className="font-data">
                      {report.model_inference_ms != null
                        ? `${report.model_inference_ms}ms`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Post ID</span>
                    <span className="font-data">{report.post_id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── Expert Validation ────────────────────────── */}
            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <UserCheck className="size-4 text-accent" />
                  Expert Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Physical reference */}
                <EditableSelect
                  label="Physical Reference (Depth)"
                  value={physRef}
                  freeText={physRefText}
                  options={PHYSICAL_REFERENCE_OPTIONS}
                  onValueChange={setPhysRef}
                  onFreeTextChange={setPhysRefText}
                />

                {/* Mobility impact */}
                <EditableSelect
                  label="Mobility Impact"
                  value={mobImp}
                  freeText={mobImpText}
                  options={MOBILITY_IMPACT_OPTIONS}
                  onValueChange={setMobImp}
                  onFreeTextChange={setMobImpText}
                />

                {/* Severity decision */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Severity decision
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["low", "moderate", "high"] as const).map((severity) => (
                      <Button
                        key={severity}
                        type="button"
                        variant={
                          selectedSeverity === severity ? "default" : "outline"
                        }
                        className="h-9 rounded-lg text-xs"
                        onClick={() => setSelectedSeverity(severity)}
                      >
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Rationale */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Rationale
                  </label>
                  <Textarea
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    placeholder="Explain your decision..."
                    className="min-h-20 resize-none rounded-lg text-xs"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <Button
                    className="flex-1 gap-2 rounded-lg"
                    disabled={!canConfirm || isPending}
                    onClick={() => setShowConfirm(true)}
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    {isPending ? "Saving..." : "Confirm"}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 rounded-lg"
                    onClick={() => setShowDiscard("next")}
                  >
                    Next
                    <ArrowRight className="size-4" />
                  </Button>
                </div>

                {/* Confirm dialog */}
                <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-sans text-base font-semibold">{isOverride ? "Override AI Classification?" : "Confirm Validation"}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {isOverride
                          ? `You are about to override the AI's classification from ${report.model_severity?.toUpperCase()} to ${selectedSeverity.toUpperCase()}.`
                          : `Confirm that the AI classification of ${report.model_severity?.toUpperCase()} is correct.`}
                        {rationale.trim() && (
                          <>
                            <br /><br />
                            <strong>Rationale:</strong> {rationale.trim()}
                          </>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (!report?.id) return;
                          mutate({
                            reportId: report.id,
                            humanSeverity:
                              selectedSeverity as "low" | "moderate" | "high",
                            rationale: rationale.trim(),
                          });
                        }}
                      >
                        {isOverride ? "Override" : "Confirm"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Discard changes dialog — Next */}
                <AlertDialog open={showDiscard === "next"} onOpenChange={(o) => !o && setShowDiscard(null)}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-sans text-base font-semibold">Leave this review?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your edits are saved as drafts. You can return to this report from the queue.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Stay</AlertDialogCancel>
                      <AlertDialogAction onClick={() => navigate("/validate")}>
                        Leave
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success dialog */}
      <AlertDialog open={showSuccess}>
        <AlertDialogContent>
          <div className="flex flex-col items-center gap-5 py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }}
              className="flex size-16 items-center justify-center rounded-full bg-emerald-100"
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="size-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
              >
                <motion.path d="M20 6L9 17l-5-5" />
              </motion.svg>
            </motion.div>
            <div className="space-y-1.5 text-center">
              <AlertDialogTitle className="font-sans text-base font-semibold">Validation Submitted</AlertDialogTitle>
              <AlertDialogDescription>
                Your decision has been recorded. Returning to the validation queue...
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
