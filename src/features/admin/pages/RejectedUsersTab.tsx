import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { DataTable } from "@/components/shared/DataTable";
import { useUsersByStatus } from "@/features/admin/hooks/useUsersByStatus";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  role: "barangay_official" | "hitl_validator" | "admin";
  status: string;
  created_at: string;
  barangay?: { name: string; district?: { name: string } } | null;
};

export function RejectedUsersTab() {
  const { data, isLoading } = useUsersByStatus("rejected");

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        id: "avatar", header: "",
        cell: ({ row }) => (
          <Avatar className="size-8"><AvatarFallback className="text-[10px] font-semibold">{row.original.full_name?.slice(0, 2).toUpperCase() ?? "??"}</AvatarFallback></Avatar>
        ),
      },
      { accessorKey: "full_name", header: "Name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.full_name}</div>
            <Badge className="badge-severity-high">Rejected</Badge>
          </div>
        ),
      },
      { accessorKey: "email", header: "Email", cell: ({ row }) => <span className="text-xs">{row.original.email}</span> },
      { accessorKey: "role", header: "Role", cell: ({ row }) => <RoleBadge role={row.original.role} /> },
      { accessorKey: "barangay", header: "Barangay", cell: ({ row }) => <span className="text-xs">{row.original.barangay?.name ?? "—"}</span> },
      { id: "district", header: "District", cell: ({ row }) => <span className="text-xs">{row.original.barangay?.district?.name ?? "—"}</span> },
      { accessorKey: "created_at", header: "Date", cell: ({ row }) => <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}</div> },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={(data ?? []) as UserRow[]} isLoading={isLoading} globalSearch />
    </div>
  );
}
