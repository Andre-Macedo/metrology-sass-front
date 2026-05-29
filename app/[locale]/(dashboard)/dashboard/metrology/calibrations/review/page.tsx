"use client"

import { useState } from "react"
import { useCalibrations, useApproveCalibration, useRejectCalibration } from "@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/hooks/use-calibrations"
import { PageHeader } from "@/components/layout/page-header"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, Eye } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { SignatureModal } from "@/features/calibrations/components/signature-modal"

export default function CalibrationReviewPage() {
    const { data, isLoading } = useCalibrations({ status: 'in_review' })
    const approveMutation = useApproveCalibration()
    const rejectMutation = useRejectCalibration()

    // Signature Modal State
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
    const [selectedCalibrationId, setSelectedCalibrationId] = useState<string | null>(null)

    const handleApproveClick = (id: string) => {
        setSelectedCalibrationId(id)
        setIsSignatureModalOpen(true)
    }

    const handleConfirmSignature = (password: string) => {
        if (!selectedCalibrationId) return

        approveMutation.mutate({ id: selectedCalibrationId, password }, {
            onSuccess: () => {
                toast.success("Calibration Approved & Published")
                setIsSignatureModalOpen(false)
                setSelectedCalibrationId(null)
            },
            onError: (error: any) => {
                toast.error(error.message || "Failed to verify signature. Invalid password.")
            }
        })
    }

    const handleReject = (id: string) => {
        rejectMutation.mutate(id, {
            onSuccess: () => toast.success("Calibration Returned for Correction")
        })
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Calibration Review Queue"
                description="Review and approve technical results before publication."
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Instrument</TableHead>
                            <TableHead>Technician</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No calibrations pending review.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((cal) => (
                                <TableRow key={cal.id}>
                                    <TableCell className="font-mono">#{cal.id}</TableCell>
                                    <TableCell>{format(new Date(cal.date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{cal.calibrated_item_name}</span>
                                            <span className="text-xs text-muted-foreground">ID: {cal.calibrated_item_id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{cal.technician}</TableCell>
                                    <TableCell>
                                        <Badge variant={cal.result === 'approved' || cal.result === 'pass' ? 'default' : 'destructive'}>
                                            {cal.result}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/dashboard/metrology/calibrations/${cal.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={() => handleApproveClick(cal.id)}
                                                disabled={approveMutation.isPending && selectedCalibrationId === cal.id}
                                            >
                                                {approveMutation.isPending && selectedCalibrationId === cal.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleReject(cal.id)}
                                                disabled={rejectMutation.isPending}
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <SignatureModal 
                isOpen={isSignatureModalOpen}
                onClose={() => {
                    setIsSignatureModalOpen(false)
                    setSelectedCalibrationId(null)
                }}
                onConfirm={handleConfirmSignature}
                isLoading={approveMutation.isPending}
            />
        </div>
    )
}
