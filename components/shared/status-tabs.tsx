"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface StatusTabOption {
    value: string
    label: string
    count?: number
}

interface StatusTabsProps {
    options: StatusTabOption[]
    value: string
    onValueChange: (value: string) => void
    className?: string
}

export function StatusTabs({ options, value, onValueChange, className }: StatusTabsProps) {
    return (
        <Tabs
            value={value}
            onValueChange={onValueChange}
            className={cn("w-full overflow-x-auto", className)}
        >
            <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground">
                {options.map((option) => (
                    <TabsTrigger
                        key={option.value}
                        value={option.value}
                        className="group gap-2 px-3"
                    >
                        {option.label}
                        {option.count !== undefined && (
                            <span className="rounded-md bg-muted-foreground/20 px-1.5 py-0.5 text-xs text-muted-foreground group-data-[state=active]:bg-background/20 group-data-[state=active]:text-foreground">
                                {option.count}
                            </span>
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
