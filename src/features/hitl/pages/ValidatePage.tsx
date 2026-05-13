import { useCallback } from "react";
import { RefreshCw, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/motion";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationEllipsis,
  PaginationPrevious,
  getPageNumbers,
} from "@/components/ui/pagination";
import { QueueOverview } from "@/features/hitl/components/QueueOverview";
import { DistrictFilter } from "@/features/hitl/components/DistrictFilter";

import { useValidationStore } from "@/stores/validation-store";
import { useValidationQueue } from "@/features/hitl/hooks/useValidationQueue";

const severityFilterOrder = ["all", "high", "moderate", "low"] as const;
const PAGE_SIZE = 8;

function parseTopConfidence(mc: unknown): { label: string; score: number } | null {
  if (!mc || typeof mc !== "object") return null;
  const obj = mc as Record<string, number>;
  const entries = Object.entries(obj).filter(
    ([, v]) => typeof v === "number" && !isNaN(v)
  );
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { label: entries[0][0], score: entries[0][1] };
}

export function ValidatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    severityFilter,
    districtFilters,
    searchQuery,
    page,
    viewedReports,
    setSeverityFilter,
    toggleDistrict,
    setSearchQuery,
    setPage,
    resetFilters,
  } = useValidationStore();
  const { data, isLoading, isFetching } = useValidationQueue({
    severity: severityFilter,
    districts: districtFilters,
    search: searchQuery,
    page,
    pageSize: PAGE_SIZE,
  });

  const reports = data?.reports ?? [];
  const totals = data?.totals ?? { total: 0, low: 0, moderate: 0, high: 0 };
  const totalCount = data?.totalCount ?? 0;
  const pageCount = data?.pageCount ?? 1;
  const hasQueue = reports.length > 0;

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["hitl", "queue"] });
  }, [queryClient]);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* ─── Header ─────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <h1 className="font-heading">Validation Queue</h1>
          <p className="text-sm text-muted-foreground">
            Review and validate AI-classified flood reports.
          </p>
        </div>

        {/* ─── Left sidebar: Overview + Filters ─────────── */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <div className="space-y-4">
            <QueueOverview
              total={totalCount}
              high={totals.high}
              moderate={totals.moderate}
              low={totals.low}
            />

            <DistrictFilter
              selected={districtFilters}
              onToggle={(d) => {
                toggleDistrict(d);
                setPage(1);
              }}
            />
          </div>

          {/* ─── Main content ──────────────────────────── */}
          <div className="space-y-4">
            {/* Filters bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[180px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by ID or location..."
                  className="h-10 rounded-lg pl-10"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {severityFilterOrder.map((s) => (
                  <Button
                    key={s}
                    variant={severityFilter === s ? "default" : "outline"}
                    size="sm"
                    className="h-9 rounded-lg text-xs"
                    onClick={() => {
                      setSeverityFilter(s);
                      setPage(1);
                    }}
                  >
                    {s === "all"
                      ? "All"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
                onClick={resetFilters}
              >
                Clear
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-9 shrink-0 rounded-lg"
                onClick={handleRefresh}
                disabled={isFetching}
                title="Refresh"
              >
                <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {/* Queue list */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="lg" label="Loading queue..." />
              </div>
            ) : hasQueue ? (
              <>
                <StaggerContainer className="space-y-3">
                  {reports.map((item, index) => {
                    const topConf = parseTopConfidence(item.model_confidence);
                    return (
                      <StaggerItem key={item.id ?? item.post_id ?? index}>
                        <div className={`relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md ${
                          item.id && viewedReports.has(item.id)
                            ? "border-accent/30 bg-accent/[0.02]"
                            : "border-border/40"
                        }`}>
                          {/* Viewed left accent bar */}
                          {item.id && viewedReports.has(item.id) ? (
                            <div className="pointer-events-none absolute inset-y-0 left-0 w-0.5 rounded-l-xl bg-accent/60" />
                          ) : null}
                          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-data text-xs text-muted-foreground">
                                  {item.post_id ?? "—"}
                                </span>
                                {item.id && viewedReports.has(item.id) ? (
                                  <Badge variant="outline" className="border-accent/30 text-[10px] font-medium text-accent">
                                    Viewed
                                  </Badge>
                                ) : null}
                                {item.model_severity ? (
                                  <SeverityBadge severity={item.model_severity} />
                                ) : null}
                              </div>
                              <p className="line-clamp-2 text-sm leading-relaxed text-foreground/80">
                                {item.post_content}
                              </p>
                              {topConf ? (
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <span className="font-medium capitalize">
                                    {topConf.label}
                                  </span>
                                  <div className="flex h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                                    <div
                                      className="rounded-full bg-accent transition-all"
                                      style={{
                                        width: `${Math.round(topConf.score * 100)}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="font-data tabular-nums">
                                    {(topConf.score * 100).toFixed(0)}%
                                  </span>
                                </div>
                              ) : null}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span>
                                  {item.barangay_name ?? "Unknown barangay"}
                                </span>
                                <span>·</span>
                                <span>
                                  {item.district_name ?? "Unknown district"}
                                </span>
                                <span>·</span>
                                <span>
                                  {item.created_at
                                    ? formatDistanceToNow(
                                        new Date(item.created_at),
                                        { addSuffix: true }
                                      )
                                    : "—"}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="lg"
                              className="shrink-0 rounded-lg border-0 px-6 font-semibold text-white shadow-sm hover:brightness-110"
                              style={{ background: "#1B617B" }}
                              onClick={() =>
                                navigate(`/validate/${item.id}`)
                              }
                            >
                              Validate
                            </Button>
                          </div>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>

                {/* Pagination */}
                {pageCount > 1 && (
                  <Pagination className="pt-2">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) {
                              setPage(page - 1);
                              document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className={
                            page <= 1 ? "pointer-events-none opacity-40" : ""
                          }
                        />
                      </PaginationItem>
                      {getPageNumbers(page, pageCount).map((p, i) => {
                        if (p === "...") {
                          return (
                            <PaginationItem key={`ellipsis-${i}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return (
                          <PaginationItem key={p}>
                            <PaginationLink
                              isActive={p === page}
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(p);
                                document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < pageCount) {
                              setPage(page + 1);
                              document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className={
                            page >= pageCount
                              ? "pointer-events-none opacity-40"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <div className="flex min-h-[30vh] items-center justify-center">
                <EmptyState
                  icon={Search}
                  title="Queue is empty"
                  description="All reports have been validated. New submissions will appear here."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
