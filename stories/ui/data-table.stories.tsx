import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock Data Type
type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
}

// Mock Columns
const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return <Badge variant={status === 'success' ? 'default' : 'secondary'}>{status}</Badge>
        }
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const payment = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(payment.id)}
                        >
                            Copy payment ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View customer</DropdownMenuItem>
                        <DropdownMenuItem>View payment details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

// Mock Data
const data: Payment[] = [
    { id: "728ed52f", amount: 100, status: "pending", email: "m@example.com" },
    { id: "489e1d42", amount: 125, status: "processing", email: "example@gmail.com" },
    { id: "b3f09a81", amount: 200, status: "success", email: "success@test.com" },
    { id: "a1b2c3d4", amount: 300, status: "failed", email: "failed@test.com" },
    { id: "e5f6g7h8", amount: 150, status: "success", email: "user1@example.com" },
    { id: "i9j0k1l2", amount: 75, status: "pending", email: "user2@example.com" },
]

const meta = {
    title: 'UI/DataTable',
    component: DataTable,
    tags: ['autodocs'],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

import { useState } from 'react';
import { PaginationState } from '@tanstack/react-table';

const DataTableWithPagination = (args: any) => {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    })

    return (
        <DataTable
            {...args}
            pagination={pagination}
            onPaginationChange={setPagination}
            rowCount={args.data.length}
        />
    )
}

export const Default: Story = {
    render: (args) => <DataTableWithPagination {...args} />,
    args: {
        columns,
        data,
    },
};

export const Loading: Story = {
    args: {
        columns,
        data: [],
        isLoading: true,
        pagination: { pageIndex: 0, pageSize: 5 },
        rowCount: 0,
    },
};

