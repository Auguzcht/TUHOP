import { useMemo } from "react";
import { Check, X } from "lucide-react";
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
  barangay?: { name: string; district?: { name: string } } | null;
};

export function PendingUsersTab() {
  const { data, isLoading } = useUsersByStatus("pending_review");
  const { mutate, isPending } = useManageUser();

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        id: "avatar", header: "",
        cell: ({ row }) => (
          <Avatar className="size-8"><AvatarFallback className="text-[10px] font-semibold">{row.original.full_name?.slice(0, 2).toUpperCase() ?? "??"}</AvatarFallback></Avatar>
        ),
      },
      {
        accessorKey: "full_name", header: "Name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.full_name}</div>
            <Badge className="badge-status-ongoing">Pending</Badge>
          </div>
        ),
      },
      { accessorKey: "email", header: "Email", cell: ({ row }) => <span className="text-xs">{row.original.email}{row.original.phone_number ? <><br /><span className="text-[10px]">{row.original.phone_number}</span></> : null}</span> },
      { accessorKey: "role", header: "Role", cell: ({ row }) => <RoleBadge role={row.original.role} /> },
      { id: "barangay", accessorFn: (r) => r.barangay?.name ?? "", header: "Barangay", cell: ({ row }) => <span className="text-xs">{row.original.barangay?.name ?? "—"}</span> },
      { id: "district", accessorFn: (r) => r.barangay?.district?.name ?? "", header: "District", cell: ({ row }) => <span className="text-xs">{row.original.barangay?.district?.name ?? "—"}</span> },
      { accessorKey: "created_at", header: "Date", cell: ({ row }) => <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}</div> },
      {
        id: "actions", header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button size="icon" variant="ghost" className="size-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" disabled={isPending}
              onClick={() => mutate({ userId: row.original.id, action: "approve" })} title="Approve">
              <Check className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600" disabled={isPending}
              onClick={() => mutate({ userId: row.original.id, action: "reject" })} title="Reject">
              <X className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [isPending, mutate]
  );

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={(data ?? []) as UserRow[]} isLoading={isLoading} globalSearch />
    </div>
  );
}
