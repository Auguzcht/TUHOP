import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPageNumbers,
} from "@/components/ui/pagination";
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
  /** When true, search scans all string columns instead of a single column */
  globalSearch?: boolean;
  filters?: FilterConfig[];
  className?: string;
  isLoading?: boolean;
  pageSize?: number;
};

export function DataTable<TData>({
  columns,
  data,
  searchKey,
  globalSearch,
  filters,
  className,
  isLoading,
  pageSize = 10,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // Reset to page 1 when data changes (new search, filter, etc.)
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [data.length]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, globalFilter },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSearch = (value: string) => {
    if (globalSearch) {
      setGlobalFilter(value);
      return;
    }
    if (!searchKey) return;
    table.getColumn(searchKey)?.setFilterValue(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    table.getColumn(key)?.setFilterValue(value === "all" ? "" : value);
  };

  const columnCount = useMemo(() => columns.length, [columns.length]);
  const pageCount = table.getPageCount();
  const currentPage = pagination.pageIndex + 1;
  const pageNumbers = getPageNumbers(currentPage, pageCount);

  return (
    <div className={cn("space-y-4", className)}>
      {(searchKey || globalSearch || filters?.length) && (
        <div className="flex flex-wrap items-center gap-3">
          {(searchKey || globalSearch) && (
            <Input
              placeholder="Search..."
              onChange={(event) => handleSearch(event.target.value)}
              className="h-10 max-w-xs rounded-lg text-xs"
            />
          )}
          {filters?.map((filter) => (
            <Select
              key={filter.key}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
              defaultValue="all"
            >
              <SelectTrigger className="h-10 w-44 rounded-lg text-xs">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.label}>
                    {option.value}
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
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                          canSort && "cursor-pointer select-none"
                        )}
                        onClick={
                          canSort
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-1.5">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {canSort ? (
                            <ArrowUpDown
                              className={cn(
                                "size-3 transition-opacity",
                                header.column.getIsSorted()
                                  ? "opacity-100"
                                  : "opacity-30"
                              )}
                            />
                          ) : null}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columnCount} className="h-32 text-center">
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
                  <TableCell colSpan={columnCount} className="h-32 text-center text-sm text-muted-foreground">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pageCount > 1 && (
        <Pagination className="pt-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => { e.preventDefault(); table.previousPage(); }}
                className={!table.getCanPreviousPage() ? "pointer-events-none opacity-40" : ""}
              />
            </PaginationItem>
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <PaginationItem key={`e-${i}`}>
                  <PaginationLink isActive={false} onClick={(e) => e.preventDefault()}>...</PaginationLink>
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === currentPage}
                    onClick={(e) => { e.preventDefault(); table.setPageIndex(p - 1); }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                onClick={(e) => { e.preventDefault(); table.nextPage(); }}
                className={!table.getCanNextPage() ? "pointer-events-none opacity-40" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
