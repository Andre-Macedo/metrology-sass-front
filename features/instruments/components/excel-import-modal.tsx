"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileSpreadsheet, Loader2, Upload, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api/client"

interface ExcelImportModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function ExcelImportModal({ isOpen, onClose, onSuccess }: ExcelImportModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [isProcessing, setIsSaving] = useState(false)
    const [preview, setPreview] = useState<any[] | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setFile(selectedFile)
        
        // Preview logic
        const reader = new FileReader()
        reader.onload = (evt) => {
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 })
            setPreview(data.slice(0, 6)) // Show header + 5 rows
        }
        reader.readAsBinaryString(selectedFile)
    }

    const handleImport = async () => {
        if (!file) return
        
        setIsSaving(true)
        try {
            // Option 1: Send binary to backend and let Laravel handle it (Best for validation)
            const formData = new FormData()
            formData.append('file', file)
            
            // Assuming we have an endpoint for this
            await apiClient.post('/metrology/instruments/import', formData)
            
            toast.success("Instruments imported successfully!")
            onSuccess()
            onClose()
        } catch (error: any) {
            console.error("Import error:", error)
            toast.error(error.message || "Failed to import instruments. Check your file format.")
        } finally {
            setIsSaving(false)
        }
    }

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { name: "Digital Caliper", serial_number: "SN-001", stock_number: "TAG-001", manufacturer: "Mitutoyo", model: "CD-6", calibration_frequency: 12, range: "0-150mm" }
        ])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Template")
        XLSX.writeFile(wb, "metrolab_import_template.xlsx")
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        Import Instruments from Excel
                    </DialogTitle>
                    <DialogDescription>
                        Upload an .xlsx or .csv file to batch-add multiple instruments at once.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-dashed">
                        <div className="text-xs space-y-1">
                            <p className="font-medium">Need a template?</p>
                            <p className="text-muted-foreground">Use our structure to avoid errors.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={downloadTemplate}>
                            Download Template
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">Excel/CSV File</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="file" 
                                type="file" 
                                accept=".xlsx, .xls, .csv" 
                                onChange={handleFileChange}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>

                    {preview && (
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Preview (First 5 rows)</Label>
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full text-[10px]">
                                    <thead className="bg-muted">
                                        <tr>
                                            {(preview[0] as any[])?.map((h, i) => (
                                                <th key={i} className="p-2 border-r text-left font-bold">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.slice(1).map((row, i) => (
                                            <tr key={i} className="border-t">
                                                {(row as any[])?.map((c, j) => (
                                                    <td key={j} className="p-2 border-r">{c}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleImport} 
                        disabled={!file || isProcessing}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Start Import
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
