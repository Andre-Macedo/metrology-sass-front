"use client"

import { useState } from "react"
import { useStandardImpact } from "@/app/[locale]/(dashboard)/dashboard/metrology/standards/hooks/use-standards"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Loader2, Search } from "lucide-react"
import { format } from "date-fns"
import { downloadFile } from "@/lib/utils"

interface ImpactAnalysisListProps {
    standardId: string
}

export function ImpactAnalysisList({ standardId }: ImpactAnalysisListProps) {
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")
    
    const { data, isLoading } = useStandardImpact(standardId, { 
        start_date: startDate || undefined,
        end_date: endDate || undefined
    })

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    const calibrations = data?.data || []

    return (
        <div className="space-y-4">
            <div className="flex items-end gap-4 bg-muted/10 p-4 rounded-lg border">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="bg-background"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="bg-background"
                    />
                </div>
                <div className="pb-0.5 text-sm text-muted-foreground">
                    Found <strong>{data?.meta?.total || 0}</strong> affected instruments.
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Instrument</TableHead>
                            <TableHead>Serial Number</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead className="text-right">Certificate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {calibrations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No calibrations found using this standard in the selected period.
                                </TableCell>
                            </TableRow>
                        ) : (
                            calibrations.map((cal: any) => (
                                <TableRow key={cal.id}>
                                    <TableCell>{format(new Date(cal.calibration_date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="font-medium">
                                        {cal.calibrated_item?.name || 'Unknown Instrument'}
                                    </TableCell>
                                    <TableCell>{cal.calibrated_item?.serial_number}</TableCell>
                                    <TableCell>
                                        <Badge variant={cal.result === 'pass' ? 'default' : 'destructive'}>
                                            {cal.result}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => downloadFile(`/calibrations/${cal.id}/pdf`, `Certificate_${cal.id}.pdf`)}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
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
