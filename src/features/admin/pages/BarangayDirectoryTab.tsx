import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/DataTable";
import { useBarangayDirectory } from "@/features/admin/hooks/useBarangayDirectory";

export function BarangayDirectoryTab() {
  const { data, isLoading } = useBarangayDirectory();
  type DirectoryRow = NonNullable<typeof data>[number];

  const columns = useMemo<ColumnDef<DirectoryRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Barangay",
        cell: ({ row }) => row.original.name,
      },
      {
        accessorKey: "district",
        header: "District",
        cell: ({ row }) => row.original.district ?? "—",
      },
      {
        accessorKey: "activeUsers",
        header: "Active Users",
        cell: ({ row }) => row.original.activeUsers,
      },
      {
        accessorKey: "reportCount",
        header: "Reports",
        cell: ({ row }) => row.original.reportCount,
      },
    ],
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
      />
    </motion.div>
  );
}
