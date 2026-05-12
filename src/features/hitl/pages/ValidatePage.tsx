import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/motion";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { ValidationBadge } from "@/components/shared/ValidationBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { DAVAO_DISTRICTS } from "@/lib/constants";
import { useValidationStore } from "@/stores/validation-store";
import { useValidationQueue } from "@/features/hitl/hooks/useValidationQueue";

const severityFilterOrder = ["all", "high", "moderate", "low"] as const;

export function ValidatePage() {
  const navigate = useNavigate();
  const {
    severityFilter,
    districtFilters,
    searchQuery,
    setSeverityFilter,
    toggleDistrict,
    setSearchQuery,
    resetFilters,
  } = useValidationStore();
  const { data, isLoading } = useValidationQueue({
    severity: severityFilter,
    districts: districtFilters,
    search: searchQuery,
  });

  const reports = data?.reports ?? [];
  const totals = data?.totals ?? { total: 0, low: 0, moderate: 0, high: 0 };
  const hasQueue = reports.length > 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="font-heading">Validation Queue</h1>
          <p className="text-sm text-muted-foreground">
            Review and validate AI-classified flood reports.
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by location or ID..."
              className="h-10 rounded-lg pl-10"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {severityFilterOrder.map((s) => (
              <Button
                key={s}
                variant={severityFilter === s ? "default" : "outline"}
                size="sm"
                className="h-9 rounded-lg text-xs"
                onClick={() => setSeverityFilter(s)}
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
            <SlidersHorizontal className="mr-2 size-3.5" />
            Reset
          </Button>
        </div>

        {/* Summary stats */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-red-500" />
            <strong className="text-foreground">{totals.high}</strong> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" />
            <strong className="text-foreground">{totals.moderate}</strong> Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-green-500" />
            <strong className="text-foreground">{totals.low}</strong> Low
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span>
            <strong className="text-foreground">{totals.total}</strong> total pending
          </span>
        </div>

        {/* Queue list */}
        {isLoading ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Loading validation queue...
          </div>
        ) : hasQueue ? (
          <StaggerContainer className="space-y-3">
            {reports.map((item, index) => (
              <StaggerItem key={item.id ?? item.post_id ?? index}>
                <Card className="card-hover overflow-hidden">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-data text-xs text-muted-foreground">
                            {item.post_id ?? "—"}
                          </span>
                          {item.model_severity ? (
                            <SeverityBadge severity={item.model_severity} />
                          ) : null}
                          <ValidationBadge
                            isValidated={false}
                            isOverridden={false}
                          />
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/80 line-clamp-2">
                          {item.post_content}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>{item.barangay_name ?? "Unknown barangay"}</span>
                          <span>{item.district_name ?? "Unknown district"}</span>
                          <span>
                            {item.created_at
                              ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
                              : "—"}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="shrink-0 rounded-lg"
                        onClick={() => navigate(`/validate/${item.id}`)}
                      >
                        Validate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <EmptyState
            icon={Filter}
            title="Queue is empty"
            description="All reports have been validated. New submissions will appear here."
          />
        )}

        {/* District filters */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {DAVAO_DISTRICTS.map((district) => (
            <Button
              key={district}
              variant={districtFilters.includes(district) ? "default" : "outline"}
              size="sm"
              className="h-8 rounded-lg text-[11px]"
              onClick={() => toggleDistrict(district)}
            >
              {district}
            </Button>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
