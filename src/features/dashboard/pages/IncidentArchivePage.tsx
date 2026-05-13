import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow, format } from "date-fns";
import { AlertTriangle, Archive, FileText, Search, ShieldCheck } from "lucide-react";

import { PageTransition } from "@/components/shared/motion";
import { StatCard } from "@/components/shared/StatCard";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
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

type IncidentRow = {
  id: string;
  post_id: string;
  post_content: string | null;
  street_address: string | null;
  barangay_name: string | null;
  district_name: string | null;
  model_severity: string | null;
  human_severity: string | null;
  flood_event_status: string | null;
  stage: string;
  status: string;
  created_at: string;
  validated_at: string | null;
  author_name: string | null;
  validator_name: string | null;
};

function useIncidents() {
  return useQuery({
    queryKey: ["dashboard", "incidents"],
    queryFn: async (): Promise<IncidentRow[]> => {
      const { data, error } = await supabase
        .from("flood_reports")
        .select(
          "id, post_id, post_content, street_address, model_severity, human_severity, flood_event_status, stage, status, created_at, validated_at, "
          + "barangay:barangays(name, districts(name)), "
          + "author:users_profile!flood_reports_author_id_fkey(full_name), "
          + "validator:users_profile!flood_reports_validator_id_fkey(full_name)"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((row: any) => ({
        id: row.id,
        post_id: row.post_id,
        post_content: row.post_content,
        street_address: row.street_address,
        barangay_name: row.barangay?.name ?? null,
        district_name: row.barangay?.districts?.name ?? null,
        model_severity: row.model_severity,
        human_severity: row.human_severity,
        flood_event_status: row.flood_event_status,
        stage: row.stage,
        status: row.status,
        created_at: row.created_at,
        validated_at: row.validated_at,
        author_name: row.author?.full_name ?? null,
        validator_name: row.validator?.full_name ?? null,
      }));
    },
    staleTime: 30_000,
  });
}

export function IncidentArchivePage() {
  const { data, isLoading } = useIncidents();
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.post_id?.toLowerCase().includes(q) ||
          r.barangay_name?.toLowerCase().includes(q) ||
          r.district_name?.toLowerCase().includes(q) ||
          r.author_name?.toLowerCase().includes(q)
      );
    }
    if (sevFilter !== "all") rows = rows.filter((r) => r.model_severity === sevFilter);
    if (stageFilter === "pending") rows = rows.filter((r) => r.stage !== "complete");
    if (stageFilter === "validated") rows = rows.filter((r) => r.status === "validated");
    if (stageFilter === "inference") rows = rows.filter((r) => r.stage === "awaiting_inference" || r.stage === "inference_failed");
    return rows;
  }, [data, search, sevFilter, stageFilter]);

  const stats = useMemo(() => {
    const all = data ?? [];
    return {
      total: all.length,
      pending: all.filter((r) => r.status !== "validated").length,
      validated: all.filter((r) => r.status === "validated").length,
      today: all.filter((r) => new Date(r.created_at).toDateString() === new Date().toDateString()).length,
    };
  }, [data]);

  const columns = useMemo<ColumnDef<IncidentRow>[]>(
    () => [
      { accessorKey: "post_id", header: "ID", cell: ({ row }) => <span className="font-data text-xs">{row.original.post_id}</span> },
      {
        accessorKey: "post_content",
        header: "Content",
        cell: ({ row }) => <span className="line-clamp-1 max-w-[200px] text-xs">{row.original.post_content ?? "—"}</span>,
      },
      { accessorKey: "barangay_name", header: "Barangay", cell: ({ row }) => <span className="text-xs">{row.original.barangay_name ?? "—"}</span> },
      { accessorKey: "district_name", header: "District", cell: ({ row }) => <span className="text-xs">{row.original.district_name ?? "—"}</span> },
      {
        accessorKey: "model_severity",
        header: "Severity",
        cell: ({ row }) =>
          row.original.model_severity ? (
            <SeverityBadge severity={row.original.model_severity as "low" | "moderate" | "high"} />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "stage",
        header: "Stage",
        cell: ({ row }) => {
          const stage = row.original.stage;
          const labels: Record<string, string> = {
            awaiting_inference: "Inference",
            inference_failed: "Failed",
            awaiting_hitl: "Pending Review",
            complete: "Complete",
          };
          return <span className="text-xs">{labels[stage] ?? stage}</span>;
        },
      },
      {
        accessorKey: "flood_event_status",
        header: "Event",
        cell: ({ row }) =>
          row.original.flood_event_status ? (
            <StatusBadge status={row.original.flood_event_status as "ongoing" | "clearing" | "resolved"} />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      { accessorKey: "author_name", header: "Author", cell: ({ row }) => <span className="text-xs">{row.original.author_name ?? "—"}</span> },
      { accessorKey: "validator_name", header: "Validator", cell: ({ row }) => <span className="text-xs">{row.original.validator_name ?? "—"}</span> },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            <div>{formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}</div>
            <div className="text-[10px]">{format(new Date(row.original.created_at), "MMM d, yyyy")}</div>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading">Incident Reports Archive</h1>
          <p className="text-sm text-muted-foreground">
            Browse all flood reports submitted across all barangays.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Archive} label="Total Reports" value={stats.total} subtext="All submissions" />
          <StatCard icon={AlertTriangle} label="Pending" value={stats.pending} subtext="Not yet validated" />
          <StatCard icon={ShieldCheck} label="Validated" value={stats.validated} subtext="HITL completed" />
          <StatCard icon={FileText} label="Today" value={stats.today} subtext="Submitted today" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by ID, barangay, author..." className="h-10 rounded-lg pl-10 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={sevFilter} onValueChange={setSevFilter}>
            <SelectTrigger className="h-10 w-36 rounded-lg text-xs">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="h-10 w-40 rounded-lg text-xs">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="validated">Validated</SelectItem>
              <SelectItem value="inference">Inference</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable columns={columns} data={filtered} isLoading={isLoading} />
      </div>
    </PageTransition>
  );
}
