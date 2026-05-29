"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner, Html5QrcodeScannerState } from "html5-qrcode"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, Camera, Loader2, X } from "lucide-react"
import { toast } from "sonner"

interface QrScannerModalProps {
    isOpen: boolean
    onClose: () => void
    onScan: (decodedText: string) => void
    title?: string
    description?: string
}

export function QrScannerModal({
    isOpen,
    onClose,
    onScan,
    title = "Scan QR Code",
    description = "Point your camera at the instrument's QR code to open its record."
}: QrScannerModalProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            // Give the DOM a moment to render the reader div
            const timer = setTimeout(() => {
                try {
                    scannerRef.current = new Html5QrcodeScanner(
                        "qr-reader",
                        { 
                            fps: 10, 
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0,
                            showZoomSliderIfSupported: true,
                            defaultZoomValueIfSupported: 2
                        },
                        /* verbose= */ false
                    )

                    scannerRef.current.render(
                        (decodedText) => {
                            // On success
                            if (scannerRef.current) {
                                scannerRef.current.clear().then(() => {
                                    onScan(decodedText)
                                }).catch(err => {
                                    console.error("Failed to clear scanner", err)
                                    onScan(decodedText) // Still return result
                                })
                            }
                        },
                        (errorMessage) => {
                            // Ignore common frame errors to avoid UI noise
                            if (errorMessage?.includes("No MultiFormat Readers")) return
                            // console.debug(errorMessage)
                        }
                    )
                } catch (err: any) {
                    console.error("Scanner init error:", err)
                    setError("Could not access camera. Please check permissions.")
                }
            }, 300)

            return () => {
                clearTimeout(timer)
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(e => console.error("Cleanup error", e))
                }
            }
        }
    }, [isOpen])

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-primary" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black flex items-center justify-center">
                    <div id="qr-reader" className="w-full h-full"></div>
                    
                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 p-6 text-center text-destructive">
                            <AlertCircle className="h-10 w-10 mb-2" />
                            <p className="font-medium">{error}</p>
                            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                                Reload Page
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-4">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
