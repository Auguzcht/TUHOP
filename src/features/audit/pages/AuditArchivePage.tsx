import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow, format } from "date-fns";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  FileText,
  Search,
} from "lucide-react";

import { PageTransition } from "@/components/shared/motion";
import { StatCard } from "@/components/shared/StatCard";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { ValidationBadge } from "@/components/shared/ValidationBadge";
import { DataTable } from "@/components/shared/DataTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type ArchivedRow = {
  id: string;
  post_id: string;
  post_content: string | null;
  model_severity: string | null;
  human_severity: string | null;
  validation_rationale: string | null;
  validated_at: string | null;
  created_at: string;
  barangay_name: string | null;
  district_name: string | null;
  validator_name: string | null;
};

function useArchivedReports() {
  return useQuery({
    queryKey: ["audit", "archive"],
    queryFn: async (): Promise<ArchivedRow[]> => {
      const { data, error } = await supabase
        .from("flood_reports")
        .select(
          "id, post_id, post_content, model_severity, human_severity, validation_rationale, validated_at, created_at, barangay:barangays(name, districts(name)), validator:users_profile!flood_reports_validator_id_fkey(full_name)"
        )
        .eq("status", "validated")
        .order("validated_at", { ascending: false });

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((row: any) => ({
        id: row.id,
        post_id: row.post_id,
        post_content: row.post_content,
        model_severity: row.model_severity,
        human_severity: row.human_severity,
        validation_rationale: row.validation_rationale,
        validated_at: row.validated_at,
        created_at: row.created_at,
        barangay_name: row.barangay?.name ?? null,
        district_name: row.barangay?.districts?.name ?? null,
        validator_name: row.validator?.full_name ?? null,
      }));
    },
    staleTime: 30_000,
  });
}

export function AuditArchivePage() {
  const { data, isLoading } = useArchivedReports();
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let rows = data ?? [];

    if (search.trim()) {
      const term = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.post_id?.toLowerCase().includes(term) ||
          r.barangay_name?.toLowerCase().includes(term) ||
          r.district_name?.toLowerCase().includes(term) ||
          r.validator_name?.toLowerCase().includes(term)
      );
    }
    if (sevFilter !== "all") {
      rows = rows.filter((r) => r.model_severity === sevFilter);
    }
    if (statusFilter !== "all") {
      rows = rows.filter((r) => {
        if (statusFilter === "confirmed")
          return r.model_severity === r.human_severity;
        if (statusFilter === "overridden")
          return r.model_severity !== r.human_severity;
        return true;
      });
    }

    return rows;
  }, [data, search, sevFilter, statusFilter]);

  const stats = useMemo(() => {
    const all = data ?? [];
    return {
      total: all.length,
      confirmed: all.filter((r) => r.model_severity === r.human_severity).length,
      overridden: all.filter((r) => r.model_severity !== r.human_severity).length,
      today: all.filter(
        (r) =>
          r.validated_at &&
          new Date(r.validated_at).toDateString() === new Date().toDateString()
      ).length,
    };
  }, [data]);

  const columns = useMemo<ColumnDef<ArchivedRow>[]>(
    () => [
      {
        accessorKey: "post_id",
        header: "Post ID",
        cell: ({ row }) => (
          <span className="font-data text-xs">{row.original.post_id}</span>
        ),
      },
      {
        accessorKey: "post_content",
        header: "Content",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-xs text-xs">
            {row.original.post_content ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "barangay_name",
        header: "Barangay",
        cell: ({ row }) => (
          <span className="text-xs">{row.original.barangay_name ?? "—"}</span>
        ),
      },
      {
        accessorKey: "district_name",
        header: "District",
        cell: ({ row }) => (
          <span className="text-xs">{row.original.district_name ?? "—"}</span>
        ),
      },
      {
        accessorKey: "model_severity",
        header: "AI",
        cell: ({ row }) =>
          row.original.model_severity ? (
            <SeverityBadge severity={row.original.model_severity as "low" | "moderate" | "high"} />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "human_severity",
        header: "Expert",
        cell: ({ row }) =>
          row.original.human_severity ? (
            <SeverityBadge severity={row.original.human_severity as "low" | "moderate" | "high"} />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <ValidationBadge
            isValidated={true}
            isOverridden={row.original.model_severity !== row.original.human_severity}
          />
        ),
      },
      {
        accessorKey: "validator_name",
        header: "Validator",
        cell: ({ row }) => (
          <span className="text-xs">{row.original.validator_name ?? "—"}</span>
        ),
      },
      {
        accessorKey: "validated_at",
        header: "Date",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            <div>
              {row.original.validated_at
                ? formatDistanceToNow(new Date(row.original.validated_at), {
                    addSuffix: true,
                  })
                : "—"}
            </div>
            <div className="text-[10px]">
              {row.original.validated_at
                ? format(new Date(row.original.validated_at), "MMM d, yyyy")
                : ""}
            </div>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="font-heading">Audit Archive</h1>
          <p className="text-sm text-muted-foreground">
            Review all validated reports, confirmation outcomes, and expert decisions.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Archive}
            label="Total Archived"
            value={stats.total}
            subtext="Validated reports"
          />
          <StatCard
            icon={CheckCircle2}
            label="Confirmed"
            value={stats.confirmed}
            subtext="AI matched expert"
          />
          <StatCard
            icon={AlertTriangle}
            label="Overridden"
            value={stats.overridden}
            subtext="Expert corrected AI"
          />
          <StatCard
            icon={FileText}
            label="Today"
            value={stats.today}
            subtext="Validated today"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, barangay, district..."
              className="h-10 rounded-lg pl-10 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={sevFilter} onValueChange={setSevFilter}>
            <SelectTrigger className="h-10 w-36 rounded-lg text-xs">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-40 rounded-lg text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="overridden">Overridden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
        />
      </div>
    </PageTransition>
  );
}
