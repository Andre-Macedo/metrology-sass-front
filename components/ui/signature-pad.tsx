import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Eraser, Save, X, PenTool } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignaturePadProps {
    onSave: (dataUrl: string) => void
    onCancel?: () => void
    existingSignatureUrl?: string | null
    loading?: boolean
    className?: string
}

export function SignaturePad({ onSave, onCancel, existingSignatureUrl, loading = false, className }: SignaturePadProps) {
    const padRef = useRef<SignatureCanvas>(null)
    const [isEmpty, setIsEmpty] = useState(true)
    const [isEditing, setIsEditing] = useState(!existingSignatureUrl)

    const clear = () => {
        padRef.current?.clear()
        setIsEmpty(true)
    }

    const save = () => {
        if (padRef.current && !padRef.current.isEmpty()) {
            const dataUrl = padRef.current.getTrimmedCanvas().toDataURL('image/png')
            onSave(dataUrl)
            setIsEditing(false)
        }
    }

    const startEditing = () => {
        setIsEditing(true)
        // Short timeout to ensure canvas is mounted before clearing (though clear is manual)
        setTimeout(() => setIsEmpty(true), 0)
    }

    if (!isEditing && existingSignatureUrl) {
        return (
            <div className={cn("flex flex-col items-center justify-center space-y-4 p-6 border rounded-xl bg-slate-50/50", className)}>
                <div className="relative group">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <img
                            src={existingSignatureUrl}
                            alt="Current Signature"
                            className="h-32 object-contain min-w-[200px]"
                        />
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">This is your current digital rubric.</p>
                <Button onClick={startEditing} variant="outline">
                    <PenTool className="mr-2 h-4 w-4" /> Replace Signature
                </Button>
            </div>
        )
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white hover:border-slate-400 transition-colors">
                <SignatureCanvas
                    ref={padRef}
                    onBegin={() => setIsEmpty(false)}
                    canvasProps={{
                        className: 'signature-canvas w-full h-[300px] cursor-crosshair',
                    }}
                    backgroundColor="rgba(255,255,255,1)"
                    minWidth={1}
                    maxWidth={2.5}
                    placeholder="Sign here"
                />

                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <span className="text-4xl font-handwriting text-slate-400">Sign Here</span>
                    </div>
                )}

                {!isEmpty && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 hover:bg-slate-100 rounded-full"
                        onClick={clear}
                        title="Clear Signature"
                    >
                        <X className="h-4 w-4 text-slate-500" />
                    </Button>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                    Use your mouse or finger to sign within the box.
                </div>
                <div className="flex gap-2">
                    {existingSignatureUrl && (
                        <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={loading}>
                            Cancel
                        </Button>
                    )}
                    <Button variant="outline" onClick={clear} disabled={isEmpty || loading}>
                        <Eraser className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button onClick={save} disabled={isEmpty || loading}>
                        <Save className="mr-2 h-4 w-4" /> Save Signature
                    </Button>
                </div>
            </div>
        </div>
    )
}
