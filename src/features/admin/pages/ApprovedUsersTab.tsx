import { useMemo } from "react";
import { Ban, RotateCcw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { DataTable } from "@/components/shared/DataTable";
import { useUsersByStatus } from "@/features/admin/hooks/useUsersByStatus";
import { useManageUser } from "@/features/admin/hooks/useManageUser";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  role: "barangay_official" | "hitl_validator" | "admin";
  status: string;
  phone_number?: string | null;
  created_at: string;
  approved_by?: string | null;
  approver_name?: string | null;
  barangay?: { name: string; district?: { name: string } } | null;
};

export function ApprovedUsersTab() {
  const { data: active } = useUsersByStatus("active");
  const { data: deactivated } = useUsersByStatus("deactivated");
  const { mutate, isPending } = useManageUser();

  const combined = useMemo(() => [...(active ?? []), ...(deactivated ?? [])], [active, deactivated]);

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
            <Badge className={row.original.status === "active" ? "badge-status-resolved" : "badge-role-validator"}>{row.original.status === "active" ? "Active" : "Deactivated"}</Badge>
          </div>
        ),
      },
      { accessorKey: "email", header: "Email", cell: ({ row }) => <span className="text-xs">{row.original.email}{row.original.phone_number ? <><br /><span className="text-[10px]">{row.original.phone_number}</span></> : null}</span> },
      { accessorKey: "role", header: "Role", cell: ({ row }) => <RoleBadge role={row.original.role} /> },
      { accessorKey: "barangay", header: "Barangay", cell: ({ row }) => <span className="text-xs">{row.original.barangay?.name ?? "—"}</span> },
      { id: "district", header: "District", cell: ({ row }) => <span className="text-xs">{row.original.barangay?.district?.name ?? "—"}</span> },
      { accessorKey: "created_at", header: "Date", cell: ({ row }) => <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}</div> },
      { id: "approved_by", header: "Approved By", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.approver_name ?? row.original.approved_by?.slice(0, 8) ?? "—"}</span> },
      {
        id: "actions", header: "",
        cell: ({ row }) =>
          row.original.status === "active" ? (
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-600" disabled={isPending}
              onClick={() => mutate({ userId: row.original.id, action: "deactivate" })} title="Deactivate">
              <Ban className="size-3.5" /> Deactivate
            </Button>
          ) : (
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" disabled={isPending}
              onClick={() => mutate({ userId: row.original.id, action: "activate" })} title="Reactivate">
              <RotateCcw className="size-3.5" /> Reactivate
            </Button>
          ),
      },
    ],
    [isPending, mutate]
  );

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={combined as UserRow[]} isLoading={!active && !deactivated} globalSearch />
    </div>
  );
}
