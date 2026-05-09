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
};

export function DataTable<TData>({
  columns,
  data,
  searchKey,
  filters,
  className,
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

  return (
    <div className={cn("space-y-4", className)}>
      {(searchKey || filters?.length) && (
        <div className="flex flex-wrap items-center gap-3">
          {searchKey && (
            <Input
              placeholder="Search"
              onChange={(event) => handleSearch(event.target.value)}
              className="max-w-xs"
            />
          )}
          {filters?.map((filter) => (
            <Select
              key={filter.key}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
              defaultValue="all"
            >
              <SelectTrigger className="w-44">
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
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
