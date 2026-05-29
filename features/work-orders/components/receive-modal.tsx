"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStations } from "@/features/system/hooks/use-system"
import { Loader2, MapPin } from "lucide-react"

interface ReceiveModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (stationId: string) => void
    isLoading?: boolean
}

export function ReceiveModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    isLoading 
}: ReceiveModalProps) {
    const [selectedStationId, setSelectedStationId] = useState<string>("")
    const { data: stationsResponse } = useStations(1, '', 100)
    const stations = (stationsResponse as any)?.data || []

    const handleConfirm = () => {
        if (!selectedStationId) return
        onConfirm(selectedStationId)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Receber Instrumento
                    </DialogTitle>
                    <DialogDescription>
                        Informe em qual bancada ou laboratório o instrumento está sendo recebido.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Localização de Destino</Label>
                        <Select value={selectedStationId} onValueChange={setSelectedStationId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o local..." />
                            </SelectTrigger>
                            <SelectContent>
                                {stations.map((s: any) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.full_path || s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={isLoading || !selectedStationId}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirmar Recebimento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
