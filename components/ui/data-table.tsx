"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    PaginationState,
    OnChangeFn,
} from "@tanstack/react-table"
import { ChevronDown, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { Skeleton } from "@/components/ui/skeleton"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
    rowCount?: number
    pagination?: PaginationState
    onPaginationChange?: OnChangeFn<PaginationState>
    renderBulkActions?: (table: any) => React.ReactNode
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading,
    rowCount = 0,
    pagination: controlledPagination,
    onPaginationChange: controlledOnPaginationChange,
    renderBulkActions,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const pagination = controlledPagination || internalPagination
    const onPaginationChange = controlledOnPaginationChange || setInternalPagination

    // If pagination is controlled, use it. Otherwise standard handling (though we aim for controlled)
    const pageCount = pagination ? Math.ceil((rowCount || data.length) / pagination.pageSize) : -1

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: onPaginationChange,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        manualPagination: true,
        pageCount: pageCount,
    })

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <div className="flex-1 flex items-center gap-2">
                    {renderBulkActions && renderBulkActions(table)}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto">
                            <Settings2 className="mr-2 h-4 w-4" />
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="w-full space-y-4">
                {/* Table Container */}
                <div className="rounded-lg border border-border bg-card relative">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                // Simple Skeleton Loader
                                Array.from({ length: pagination?.pageSize || 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {columns.map((col, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className="h-6 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
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
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer Controls */}
                <DataTablePagination table={table} rowCount={rowCount} />
            </div>

        </div>
    )
}
