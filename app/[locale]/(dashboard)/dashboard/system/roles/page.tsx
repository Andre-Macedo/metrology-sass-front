"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Plus, Edit, MoreHorizontal, Shield } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRoles } from "@/features/system/hooks/use-system"
import { Badge } from "@/components/ui/badge"

// Simple placeholder for Role type until we have a proper hook/type
interface Role {
    id: number
    name: string
    permissions: string[]
    created_at: string
}

export default function RolesPage() {
    const { data: roleNames, isLoading } = useRoles()

    // transform string[] to mock Role[] for display if needed, or update useRoles to return objects
    // For now assuming the API might return just names as per use-system.ts
    // We'll mock the table data for visual consistency if real data is missing structure

    const roles: Role[] = roleNames ? roleNames.map((name, i) => ({
        id: i + 1,
        name: typeof name === 'string' ? name : (name as any).name,
        permissions: ['read-only'], // dummy
        created_at: new Date().toISOString()
    })) : []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Roles & Permissions"
                    description="Manage system access levels."
                />
                <Button disabled>
                    <Plus className="mr-2 h-4 w-4" /> Add Role
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role Name</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : roles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No roles found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        {role.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{role.permissions.length} permissions</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem disabled>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
