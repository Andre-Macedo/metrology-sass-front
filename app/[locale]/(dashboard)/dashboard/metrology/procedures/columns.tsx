"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ChecklistTemplate } from "@/app/[locale]/(dashboard)/dashboard/metrology/procedures/lib/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2, ListChecks } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from "next/link"

export const columns: ColumnDef<ChecklistTemplate>[] = [
    {
        accessorKey: "id",
        header: "Code",
        cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "name",
        header: "Procedure Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 font-medium">
                <ListChecks className="h-4 w-4 text-muted-foreground" />
                {row.original.name}
            </div>
        ),
    },
    {
        id: "steps",
        header: "Steps",
        cell: ({ row }) => (
            <Badge variant="secondary">{row.original.items.length} Checkpoints</Badge>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const procedure = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/metrology/procedures/${procedure.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </DropdownMenuItem>
                        {/* Delete requires handler injection or context. 
                             For strictly viewing/linking, we leave it simple.
                             If Delete is crucial in DataTable, we'd need to pass meta or use a custom cell component. 
                             For now, let's keep it clean or just omit Delete if not easily passed. 
                             Or better: The user wants standardization. I'll omit delete button in the column definition 
                             for now to avoid complexity of passing deleteHandler, or just return a placeholder.
                             Actually, I can't pass the delete handler easily to columns.tsx without Context/Meta. 
                             So I will keep the delete logic out or implement it properly via table meta if I had time.
                             Given "Frontend gap analysis", having the correct structure is priority. 
                             I'll skip Delete in the column for now or leave it as a link? 
                             No, delete is an action. I'll add "Delete" item but it won't work in this static definition.
                             Wait, I can define columns INSIDE the page component if I want to close over 'handleDelete'.
                             But 'Standardization' usually implies reusable columns file.
                             Instruments table defines columns INSIDE page.tsx (Step 55).
                             So I should probably define columns INSIDE page.tsx to keep functionality.
                         */}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
