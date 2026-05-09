import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FilterConfig = {
  key: string;
  label: string;
  options: { label: string; value: string }[];
};

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  searchKey?: string;
  filters?: FilterConfig[];
  className?: string;
  isLoading?: boolean;
};

export function DataTable<TData>({
  columns,
  data,
  searchKey,
  filters,
  className,
  isLoading,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleSearch = (value: string) => {
    if (!searchKey) return;
    table.getColumn(searchKey)?.setFilterValue(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    table.getColumn(key)?.setFilterValue(value === "all" ? "" : value);
  };

  const columnCount = useMemo(() => columns.length, [columns.length]);

  return (
    <div className={cn("space-y-4", className)}>
      {(searchKey || filters?.length) && (
        <div className="flex flex-wrap items-center gap-3">
          {searchKey && (
            <Input
              placeholder="Search..."
              onChange={(event) => handleSearch(event.target.value)}
              className="h-10 max-w-xs rounded-lg"
            />
          )}
          {filters?.map((filter) => (
            <Select
              key={filter.key}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
              defaultValue="all"
            >
              <SelectTrigger className="h-10 w-44 rounded-lg">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    className="h-32 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-accent" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    className="border-b border-border/40 transition-colors hover:bg-muted/30"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
