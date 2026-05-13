import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/DataTable";
import { useBarangayDirectory } from "@/features/admin/hooks/useBarangayDirectory";

type DirectoryRow = {
  id: string;
  name: string;
  district: string | null;
  activeUsers: number;
  reportCount: number;
};

export function BarangayDirectoryTab() {
  const { data, isLoading } = useBarangayDirectory();

  const columns = useMemo<ColumnDef<DirectoryRow>[]>(
    () => [
      { accessorKey: "name", header: "Barangay", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
      { accessorKey: "district", header: "District", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.district ?? "—"}</span> },
      { accessorKey: "activeUsers", header: "Officials", cell: ({ row }) => <span className="font-data text-xs tabular-nums">{row.original.activeUsers}</span> },
      { accessorKey: "reportCount", header: "Reports", cell: ({ row }) => <span className="font-data text-xs tabular-nums">{row.original.reportCount}</span> },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} globalSearch />
    </div>
  );
}
