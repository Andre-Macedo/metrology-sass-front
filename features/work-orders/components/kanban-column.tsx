"use client"

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
    id: string
    title: string
    count: number
    children: React.ReactNode
}

export function KanbanColumn({ id, title, count, children }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id })

    return (
        <div className="flex flex-col w-80 shrink-0 bg-muted/30 rounded-xl border p-3">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-tight">{title}</h3>
                    <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm">
                        {count}
                    </span>
                </div>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 overflow-y-auto min-h-[200px] transition-colors rounded-lg border-2 border-transparent",
                    isOver && "bg-primary/5 border-dashed border-primary/20"
                )}
            >
                <SortableContext id={id} items={React.Children.toArray(children).map((child: any) => child.key)} strategy={verticalListSortingStrategy}>
                    {children}
                </SortableContext>
            </div>
        </div>
    )
}
