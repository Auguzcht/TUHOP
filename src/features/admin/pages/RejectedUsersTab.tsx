import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/DataTable";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useManageUser } from "@/features/admin/hooks/useManageUser";
import { useUsersByStatus } from "@/features/admin/hooks/useUsersByStatus";

export function RejectedUsersTab() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useUsersByStatus("rejected", search);
  const { mutate, isPending } = useManageUser();
  type UserRow = NonNullable<typeof data>[number];

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Name",
        cell: ({ row }) => row.original.full_name ?? "Unknown",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email ?? "—",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.original.role;
          return role === "barangay_official" || role === "hitl_validator" || role === "admin" ? (
            <RoleBadge role={role} />
          ) : (
            <Badge variant="outline">Unassigned</Badge>
          );
        },
      },
      {
        accessorKey: "barangay",
        header: "Barangay",
        cell: ({ row }) => row.original.barangay?.name ?? "—",
      },
      {
        accessorKey: "district",
        header: "District",
        cell: ({ row }) => row.original.barangay?.districts?.name ?? "—",
      },
      {
        accessorKey: "created_at",
        header: "Submitted",
        cell: ({ row }) =>
          row.original.created_at
            ? formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })
            : "—",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="h-8 rounded-lg"
              disabled={isPending}
              onClick={() =>
                mutate({ userId: row.original.id, action: "activate" })
              }
            >
              Reactivate
            </Button>
          </div>
        ),
      },
    ],
    [isPending, mutate]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="space-y-4">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-10 max-w-xs rounded-lg"
        />
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
        />
      </div>
    </motion.div>
  );
}
