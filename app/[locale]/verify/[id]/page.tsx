"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, FileText, Loader2, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

interface PublicInstrument {
    id: string
    name: string
    serial_number: string
    manufacturer: string
    model: string
    status: string
    calibration_due: string | null
    last_calibration_date: string | null
    certificate_url: string | null
    is_valid: boolean
}

export default function PublicVerificationPage() {
    const params = useParams()
    const id = params.id as string
    const [instrument, setInstrument] = useState<PublicInstrument | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchInstrument = async () => {
            try {
                // Direct fetch bypassing standard hooks to ensure it works with public endpoint
                const response = await apiClient.get<PublicInstrument>(`/public/instruments/${id}`)
                setInstrument(response.data)
            } catch (e) {
                console.error(e)
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        fetchInstrument()
    }, [id])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-10 w-10 animate-spin text-slate-400" /></div>
    }

    if (error || !instrument) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md border-red-200 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <CardTitle className="text-red-700">Instrument Not Found</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground">
                        <p>The QR Code you scanned is invalid or the instrument has been removed.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
            <Card className={`w-full max-w-md shadow-xl border-t-8 ${instrument.is_valid ? 'border-t-green-500' : 'border-t-red-500'}`}>
                <CardHeader className="text-center pb-2">
                    <div className={`mx-auto p-4 rounded-full w-fit mb-4 ${instrument.is_valid ? 'bg-green-100' : 'bg-red-100'}`}>
                        {instrument.is_valid ? (
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        ) : (
                            <AlertTriangle className="h-12 w-12 text-red-600" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">{instrument.name}</h1>
                    <p className="text-slate-500 font-mono text-sm">{instrument.serial_number}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="text-center">
                        <Badge className={`text-lg px-4 py-1 ${instrument.is_valid ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            {instrument.is_valid ? 'CALIBRATED' : 'NOT COMPLIANT'}
                        </Badge>
                        {!instrument.is_valid && (
                            <p className="text-red-600 text-sm mt-2 font-medium">Do not use this instrument.</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm border-t border-b py-4 bg-slate-50/50">
                        <div>
                            <p className="text-muted-foreground">Manufacturer</p>
                            <p className="font-medium">{instrument.manufacturer || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Model</p>
                            <p className="font-medium">{instrument.model || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Last Calib.</p>
                            <p className="font-medium">
                                {instrument.last_calibration_date ? format(new Date(instrument.last_calibration_date), 'dd/MM/yyyy') : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Due Date</p>
                            <p className={`font-medium ${instrument.is_valid ? 'text-green-700' : 'text-red-700'}`}>
                                {instrument.calibration_due ? format(new Date(instrument.calibration_due), 'dd/MM/yyyy') : '-'}
                            </p>
                        </div>
                    </div>

                    {instrument.certificate_url && (
                        <Button className="w-full" size="lg" asChild>
                            <a href={instrument.certificate_url} target="_blank" rel="noopener noreferrer">
                                <FileText className="mr-2 h-5 w-5" />
                                Download Certificate
                            </a>
                        </Button>
                    )}

                    <div className="text-center text-xs text-muted-foreground pt-4">
                        Verified by Amemiya Metrology System
                        <br />
                        {new Date().toLocaleString()}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
